import os, re, sys
import tensorflow as tf
import tensorflow_hub as hub
import numpy as np

# Import from local directory (files are already present in genai folder)
from netUtils import batchGen, getTestSet, customCatLoss
from postprocess import pkHistory, pkbatch
import h5py
import matplotlib.pyplot as plt

from keras.layers import Layer, Dense, Input, Lambda, Dropout, Flatten, multiply, \
    Bidirectional, Activation, TimeDistributed, Concatenate, Reshape, LSTM

# CuDNNLSTM is deprecated in newer TensorFlow versions
# We'll use regular LSTM with specific configuration for compatibility
CUDNN_AVAILABLE = False
from keras import Model, Sequential
from keras import regularizers
from keras.models import model_from_json
import keras.backend as K
from keras.callbacks import ModelCheckpoint

# Import tensorflow hub module - Universal Sentence Encoder
# More information can be found here:
# https://tfhub.dev/google/universal-sentence-encoder-large/3
print('importing hub')
url = "https://tfhub.dev/google/universal-sentence-encoder-large/3"
embed = hub.KerasLayer(url, trainable=True)

class SliceNet():
    def __init__(self,
                 classification,
                 class_weights,
                 pretrain=False,
                 weights_path=None,
                 attention=False,
                 maxlen=None,
                 drop_prob=0.2,
                 reg=1e-2):
        """SliceCast network class for text segmentation. Predicts sentence
        level cutoff labels
        Args:
            classification: Boolean indicateing that the model is performing cla
ssification
                            If false, the model is performing regression.
            class_weights: Class weights for categorical cross entropy loss.
                            Tuple of 3 values
                                (class0: non-cutoff,
                                 class1: cutoff,
                                 class2: pad)
            pretrain: Boolean indicating that the model will load pretrain weigh
ts
            weights_path: File from which to load pretrained model weights. If '
pretrain'
                            is false, weights_path may be set to None
            attention: Boolean indicating whether self-attention mechanism shoul
d be used
            maxlen: Integer representing the maximum number of sentences per doc
ument.
                    If 'None', then the maxlen will vary each batch.
            drop_prob: Dropout probability for dense layers
            reg: L2 regularization coefficient for dense layers
        """
        self.pretrain = pretrain
        self.classification = classification
        self.drop_prob = drop_prob
        self.reg = regularizers.l2(reg)
        self.class_weights = class_weights
        self.maxlen = maxlen
        self.attention = attention
        if self.pretrain:
            self.weights_path = weights_path

        self.model = self._defineModel()

    def map_docs(self, x):
        """Helper function to embed a given list of sentences using
        the google universal sentence encoder from tfhub"""
        return embed(x, signature='default', as_dict=True)['default']

    def UniversalEmbedding(self, x):
        """Embedding layer that calls the map_docs function for each
        document in the batch. The result is an encoding for each sentence
        of each document in the mini-batch"""

        # Explicitly cast the input tensor to strings
        x_str = tf.cast(x, tf.string)

        # Embed each sentence of the input tensor
        embedTens = tf.map_fn(self.map_docs, x_str, dtype=tf.float32)
        return embedTens

    def _defineModel(self):        # Define network structure
        encoderIn = Input(shape=(self.maxlen,), dtype='string', name='encoderIn')
        encoderOut = Lambda(self.UniversalEmbedding, name='encoderOut',
                            output_shape=(self.maxlen, 512))(encoderIn)

        #######################################################
        # Attention:
        # Compute importance for each step
        # credit: https://github.com/keras-team/keras/issues/4962
        #######################################################
        if self.attention:
            attention = TimeDistributed(Dense(1, activation='tanh'))(encoderOut)
            encoderOut = multiply([encoderOut, attention])        # 2 Stacked Bidirectional LSTMs
        # Use regular LSTM as in original SliceCast code
        lstm1 = Bidirectional(LSTM(256, return_sequences=True), name='lstm1')(encoderOut)
        activations = Bidirectional(LSTM(256, return_sequences=True), name='lstm2')(lstm1)

        output = TimeDistributed(Dense(256, activation='relu',
                                       kernel_regularizer=self.reg))(activations)
        output = Dropout(self.drop_prob)(output)
        output = TimeDistributed(Dense(64, activation='relu',
                                           kernel_regularizer=self.reg))(output)        # Final output is different for classification and regression models
        if self.classification:
            preds = TimeDistributed(Dense(3, activation='softmax'))(output)
            model = Model(inputs=encoderIn, outputs=preds)
            model.compile(loss=customCatLoss(self.class_weights),
                          optimizer='adam',
                          metrics=['categorical_accuracy'])
        else:
            preds = TimeDistributed(Dense(1, activation='sigmoid'))(output)
            model = Model(inputs=encoderIn, outputs=preds)
            model.compile(loss='mean_squared_error', optimizer='adam', metrics=['mae'])
        return model

    def train(self,
              train_files,
              val_files,
              test_file,
              batch_size=16,
              epochs=3,
              steps_per_epoch=1000,
              test_steps=8,
              save=True,
              k=8):
        """ Training function for SliceNet model
        Args:
            train_files: List of training hdf5 files as strings. Each hdf5 file
                         contains examples that will be batched to the network
            val_files: List of validation hdf5 files as strings. Each hdf5 file
                         contains examples that will be batched to the network
            test_file: Single HDF5 file containing test examples
            batch_size: Number of training examples per batch
            epochs: Number of epochs to train over data
            steps_per_epoch: Number of batches per epoch
            test_steps: Number of batches to test after each epoch
            save: Boolean indicating that model weights will be
                  saved periodically during training
            k: K-value for Pk score when evaluating test set.
               see 'postprocess.py' for more details on Pk score
        Return:
            history: Keras training history object
            pk: Pk metric object containing pk scores throughout training        """
        # Define batch generator for training and validation
        trainGen = batchGen(train_files, batch_size, self.maxlen, classification=self.classification)
        valGen = batchGen(val_files, batch_size, self.maxlen, classification=self.classification)

        self.model.summary()
        print('Starting Training')
        
        # In TensorFlow 2.x, sessions are not needed - eager execution is default
        if self.pretrain:
            self.model.load_weights(self.weights_path)

        # Define model callbacks
        save_weights = ModelCheckpoint('./models/weights_epoch{epoch:03d}.h5',
                                     save_weights_only=True, period=2)
        pk = pkHistory(test_file=test_file, num_samples=test_steps, k=k)

        # Train network - fit_generator is deprecated, use fit instead
        history = self.model.fit(trainGen,
                                steps_per_epoch=steps_per_epoch,
                                epochs=epochs,
                                verbose=1,
                                validation_data=valGen,
                                validation_steps=1,
                                callbacks=[save_weights, pk])

        if save:
            # Serialize weights to HDF5
            self.model.save_weights('./models/weights_final.h5')
            print("Saved weights to disk")

        return history, pk

    def predict(self, test_file, num_samples, weights_path, k):
        """Batch inference for SliceNet model
        Args:
            test_file: Hdf5 file on which to run inference
            num_samples: Number of samples from test file to run inference on
            weights_path: Path to pretrained model weights
            k: K-value for Pk score when evaluating test set.
               see 'postprocess.py' for more details on Pk score
        Return:
            preds: Numpy array of predictions for each sentence of each
                   document in the test set.
                   Shape = [num_documents, num_sentences, num_classes]
            y_test: Labels for each sentence of each document in the test
                    set. Shape is identical to 'preds'
            pk: Pk metric object containing pk scores throughout training
        """        # Get test data and test labels
        X_test, y_test = getTestSet(test_file, num_samples=num_samples)
        
        print('Starting Testing')
        
        # In TensorFlow 2.x, sessions are not needed - eager execution is default
        # load weights into model
        self.model.load_weights(weights_path)
        print("Loaded weights from disk")

        preds = self.model.predict(X_test)
        # Calculate pk score for the minibatch
        pk = pkbatch(y_test, preds, k)

        return preds, y_test, pk
    
    def singlePredict(self, X_test, weights_path):
        """Batch inference for SliceNet model
        Args:
            X_test: Single example document on which to run inference
                    Numpy array of shape=[1, num_sentences]
            weights_path: Path to pretrained model weights
        Return:            preds: Numpy array of predictions for each sentence of the document
                   Shape = [1, num_sentences, num_classes]
        """
        print('Starting Testing')
        
        # In TensorFlow 2.x, sessions are not needed - eager execution is default
        # load weights into model with error handling for incompatible layers
        try:
            self.model.load_weights(weights_path)
            print("Loaded weights from disk")
        except ValueError as e:
            if "Shape mismatch" in str(e):
                print(f"Warning: Shape mismatch in weights. Attempting partial load...")
                # Try to load weights by name, skipping incompatible ones
                try:
                    self.model.load_weights(weights_path, by_name=True, skip_mismatch=True)
                    print("Loaded compatible weights from disk (some layers skipped)")
                except Exception as e2:
                    print(f"Could not load any weights: {e2}")
                    print("Proceeding with randomly initialized weights...")
            else:
                raise e        # Convert input to proper format for TensorFlow string processing
        # The model expects string tensors, not numpy arrays
        if isinstance(X_test, np.ndarray):
            # Convert numpy array to list of lists of strings
            X_test_list = []
            for doc in X_test:
                if isinstance(doc, np.ndarray):
                    # Convert each sentence to Python string
                    X_test_list.append([str(sent) for sent in doc])
                else:
                    X_test_list.append([str(sent) for sent in doc])
            
            print(f"Converted input to list format: {len(X_test_list)} documents")
            print(f"First document has {len(X_test_list[0])} sentences")
            
            # Create TensorFlow tensor directly from the list
            X_test_tensor = tf.constant(X_test_list, dtype=tf.string)
            print(f"Created TensorFlow tensor with shape: {X_test_tensor.shape}")
        else:
            X_test_tensor = tf.constant(X_test, dtype=tf.string)

        preds = self.model.predict(X_test_tensor)

        return preds