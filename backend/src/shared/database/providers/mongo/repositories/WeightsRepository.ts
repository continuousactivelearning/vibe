import { IScoringWeights } from '#gamification/interfaces/scoring.js';
import { MongoDatabase } from '#shared/database/providers/mongo/MongoDatabase.js';
import { injectable, inject } from 'inversify';
import { Collection, ClientSession, ObjectId } from 'mongodb';
import { InternalServerError } from 'routing-controllers';
import { GLOBAL_TYPES } from '#root/types.js';

@injectable()
export class ScoringWeightsRepository {
    private weightsCollection: Collection<IScoringWeights>;
    private readonly GLOBAL_WEIGHTS_ID = new ObjectId('000000000000000000000001');
    constructor(
        @inject(GLOBAL_TYPES.Database)
        private db: MongoDatabase,
    ) {}

    private async init() {
        if (!this.weightsCollection) {
            this.weightsCollection = await this.db.getCollection<IScoringWeights>('scoring_weights');
        }
    }

    public async get(session?: ClientSession): Promise<Omit<IScoringWeights, '_id'>> {
    await this.init();
    const weights = await this.weightsCollection.findOne(
        { _id: this.GLOBAL_WEIGHTS_ID },
        { session }
    );

    if (!weights) {
        console.log('[ScoringWeightsRepository] No weights found. Creating default weights...');
        return this.createDefaultWeights(session);
    }

    console.log('[ScoringWeightsRepository] Retrieved weights from DB.');
    const { _id,createdAt,updatedAt, ...weightsWithoutId } = weights;
    return weightsWithoutId;
}


public async update(
    newWeights: Partial<IScoringWeights>,
    session?: ClientSession
): Promise<Omit<IScoringWeights, '_id'>> {
    await this.init();
    
    const updateData = {...newWeights};
    delete updateData._id;
    
    const result = await this.weightsCollection.findOneAndUpdate(
        { _id: this.GLOBAL_WEIGHTS_ID },
        { $set: updateData },
        { 
            upsert: true,
            returnDocument: 'after',
            session
        }
    );

    if (!result) {
        throw new InternalServerError('Failed to update scoring weights');
    }

    const { _id,createdAt,updatedAt, ...weightsWithoutId } = result;
    return weightsWithoutId;
}

    private async createDefaultWeights(session?: ClientSession): Promise<Omit<IScoringWeights, '_id'>> {
        const defaultWeights: Omit<IScoringWeights, '_id'> = {
            highWeight: 2,
            lowWeight: 1,
            hintPenalty: -0.5,
            streakBonus: 3,
            timeWeight: 0.2,
            attemptPenalty: -0.5,
        };

        await this.weightsCollection.insertOne(
            {
                _id: this.GLOBAL_WEIGHTS_ID,
                ...defaultWeights
            },
            { session }
        );

        return defaultWeights;
    }
}