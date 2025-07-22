import * as React from "react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2, Play, Check, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

// No props needed for a page

interface TaskRun {
  id: string;
  timestamp: Date;
  status: "loading" | "done" | "failed";
  result?: string; // was any
  parameters?: Record<string, unknown>; // was any
}

interface TaskRuns {
  transcription: TaskRun[];
  segmentation: TaskRun[];
  question: TaskRun[];
  upload: TaskRun[];
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

interface Segment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  questions: Question[];
}

interface VideoData {
  _id: string;
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  status: string;
  progress: number;
  currentStep: string;
  uploadDate: string;
  transcript: string;
  segments: Segment[];
  createdAt: string;
  updatedAt: string;
  duration: number;
}

  // json data for quiz questions
  const sampleVideoData: VideoData = {
    "_id": "6831b558b4dee3410d3142eb",
    "id": "6ab9b5c0-9acd-4479-a0f2-74e30c3e093a",
    "filename": "video-1748088151484-122418722.mp4",
    "originalName": "Video Editing Demo - Made with Clipchamp.mp4",
    "mimetype": "video/mp4",
    "size": 62955908,
    "status": "completed",
    "progress": 100,
    "currentStep": "Processing completed successfully!",
    "uploadDate": "2025-05-24T12:02:32.577Z",
  "transcript": "Hi there, my name is Ganesh and this is my walkthrough of my video editor backend project. This is ExpressJS, WordPress SQL, with this over M and FM and PG for video processing. The goal of this application is to provide a scalable backend services for web-based video editor. Following the given assignment structure, it supports uploading videos, trimming, trimming and adding subtitles, rendering final of and downloading the result all by a few interesting APIs. So let me show you the GitHub repository. And here is the GitHub repository and readme file which includes the structured format of the application. So let me get through our project. So I have to build it. So let's start with the upload feature. So I have built a basic intent to interact with the backend here. Here I will select a sample file and upload it. So this is a basic intent to interact with the backend. So I will choose a video to... I will take this. So I will upload now. When I upload the video gets saved into the database and the server extracts metadata, like duration, size and file name using FM, FF, MP, and all of this is auditing database via Prisma. So when I take upload... So I will show the entry. So here is the entry of the new video product. So I will copy the idea of the video and I will upload it. So you can see the new entry made in database. And I am using super-based support presses 12 for database. So I selected the video ID. So let's go to the next part of the video, trimming the video. So in the front end, I will enter the video ID and I will like a wide to 15 seconds. So I will take a trim. So this ends the request to the AAS-Videos-ID slash trimming and what which was the FFM-BG to cut them that portion and save it to the directory. So the trimmer video gets a lot of... Here you can see the... As it ends successfully trim the video. So you can see the video is trimmed too. So the video is like one minute. Now we can see only 5 to 15 seconds of the... 10 seconds duration is trimmer term. So now let's go to the next part of the video. That is adding subtitles. So I will... Using the subtitle form, I can add a line of text and specify the start and intent. Correctly. This stores the subtitle into the database. And although the SAT file is not yet implemented. So the saving converting to SAT file is not working functionally. That's some... So the... When I enter the video ID and this is the... Triter... Start signal, let me give it to like 3 to 10 seconds. And I will add subtitles. So we can see that back and responded with success. So I will show... And since the subtitle is stored in the database, you can see the new entry in the database. Subtitle... See, this is the subtitle. We can see the new entry made in... And you can also see the ID to be made. It is also implemented in the database. We can see the start time file to 5 to 15 seconds. The video is streamed. And now let's go to the... Finally, we render the video. Like we select the ID. So... I will render this. So after rendering, I will download this video. So now let's go to our... I have implemented this locally. So I can see the final video of... I will show you. So you can see the successful accepted title has been laid on the video. And the video trimming has got down to... It's my part where I am matching with the postlates as well. And... I used it as a... Which was the routing. It's my overm for connection to... So the postlates as well database. So I created various functions for... To use fm. You can see the video pressing library. And here's the function secreted. So we can... So for trimming the video, it is the function like... The service has... And here is for creating a subtitle. And finally, adding text to the video. Which... It takes a subtitle from the database. And we'll always find out the video. And final render. And... Let's... So... The video panel which was the services of the fm.bj video. Processing library. Here it is the... Control of various controllers for uploading video. Trim video. And... Adding subtitles. The rendering video. And... Download video. So I am adding this controller to the... My router is as mentioned in the assignment. So the first... The uploadout. And second one is the... Trim route. And the one subtitle route. And fourth is render. And download. So... You can see the server is set up. And using express... For routing. And... This is the code for a security server. I... Basically... I use WilliamQ and... It is... It is implemented at the final stage. It is not working properly. But I tried my best to implement it for... Performing background tasks. So here is the code you can see. And... By now, I implemented local storage for... Floating and downloading videos. You can further scale it to... Make it... Getable by using Amazon history or like that. So... I also used the basic simple index arrangement too. So... The... The backend works. And the functioning of the backend. And... Here is the red memory file port. So... Thank you for taking the time to leave with this project. This was great tension challenge combining backend APIs. Video processing time for you. The full source code will be... In the GitHub repo. You can see this in my GitHub repo. You can visit and I will be posted in the... Assignment. Watch the meeting. Thank you.",
    "segments": [
      {
      "id": "cc0c2bff-92d8-4fab-b256-067ef9cf6639",
        "startTime": 0,
      "endTime": 300,
      "text": "Hi there, my name is Ganesh and this is my walkthrough of my video editor backend project...",
      "questions": [
        {
          "id": "8a1dd040-4df7-4845-85aa-8d2d0bf6c0f0",
          "question": "What is the main purpose of the application discussed in this walkthrough?",
          "options": [
            "To build a simple video player",
            "To create a scalable backend for a web-based video editor",
            "To develop a photo editing software",
            "To design a database management system"
          ],
          "correctAnswer": 1,
          "difficulty": "medium",
          "topic": "Application Purpose"
        },
        {
          "id": "d0fb88fc-32cf-473c-ba7c-a804fa1832b9",
          "question": "Which tool is used for video processing in the application?",
          "options": [
            "M and FM",
            "WordPress SQL",
            "PG",
            "FF, MP"
          ],
          "correctAnswer": 3,
          "difficulty": "easy",
          "topic": "Video Processing"
        },
        {
          "id": "54cbe356-2240-41a7-a364-607a8ee62684",
          "question": "Which database system is used for auditing in the application?",
          "options": [
            "PostgreSQL",
            "MySQL",
            "MongoDB",
            "SQLite"
          ],
          "correctAnswer": 1,
          "difficulty": "medium",
          "topic": "Database"
        },
        {
          "id": "6822db19-c2b6-4983-bcbf-59f220593a9a",
          "question": "What does the trimming feature allow in the video editor application?",
          "options": [
            "Allows users to add effects to videos",
            "Allows users to edit audio tracks of a video",
            "Allows users to split videos into multiple clips",
            "Allows users to adjust video resolution"
          ],
          "correctAnswer": 2,
          "difficulty": "hard",
          "topic": "Trimming Feature"
        }
      ]
      }
    ],
    "createdAt": "2025-05-24T12:02:32.586Z",
    "updatedAt": "2025-05-24T12:09:32.565Z",
  "duration": 3000
};

const sampleTranscript = {
  "text": " Hello everyone, this is Meenakshi, research scholar at IIT, Roper. In this session, let us look at Exit Ticket, your shortcut to unravel student understanding. Let us take a classroom where the teacher has just finished his class and is leaving the classroom. Students are leaving the classroom. Have you ever wondered how you could measure your students understood your lecture? What if there was a simple yet powerful way to bridge today's learning of students with tomorrow's lesson? Welcome to Exit Tickets, a quick and effective method to gather students feedback and refine your teaching. Let us look at this classroom. Here the teacher tries to collect feedback. The teacher collects handwritten feedbacks. Yes, it is good to collect feedback from students. Let's say you have a classroom of 100 or 200 students. How do you collect all the feedback? Yes, you collect it written in papers and now you have a pile of papers. Will you be able to value all the papers before tomorrow's class? Yes, this is a challenging question to answer. Let's look at this. Here the teacher actually collects exit tickets. Exit tickets are short structured reflections students complete at the end of a session. These actually help educators assess the comprehension and address gaps and tailor the next lesson effectively. How is this advantageous than the paper feedback that the previous teacher collected? This is because this teacher finds it very easy to comprehend and analyze the feedback given by students although there is a huge number of feedbacks here. What are these exit tickets? Exit tickets can take various forms. A simple question like what was the most important thing that you learned today or on a rating of how confident you feel about the topic. So a very simple question can give you a good idea of whether the student has actually understood the concept. The student is confident about the concept. Whether you will have to brush up the concept a little more in the next class before diving into the deeper into the concept. Let us try creating a Google form for exit tickets. So to create a Google form, we need to open the Google forms site. I opened Google and type Google forms. Google forms sign in. Now here when the forms site opens, you will see forms.google.com open and here you are seeing a template which is called exit ticket. Click on the template to open it. As you are seeing, this is a Google form which is already populated. Some of you might be aware of this Google forms, but here exit ticket is a specific template of the Google form which helps us to collect feedback of students or any learners immediately after a session. We call it an exit ticket because when the students leave a classroom, they would have to fill in a form based on their understanding of the classroom lectures. Let us take a look at the template design. First it says exit ticket and we have the name as the first question here. Second we also collect the email ID of the students. Here what you see is what's one important thing you learn in today's class. Okay, so you can also double click it to change the question a little bit. Mention two concepts that you remember from today's session. So you can write your own question, just double click to edit the questions. After you type the question, click outside the form so that you save this question. It immediately gets saved. Now did you feel prepared for today's lesson? Why or why not? So why do we ask this question? We have to ask this question because we need to know if the student has come with the prerequisites for the class. Let's say you have already told your students to revise differential calculus for the class or you want them to come up with some reading material, complete the reading material and come. So we need to also know whether the student came to the class well prepared or not. So this is another question that can be asked. Anyways, you have an option of double clicking and then you can edit the question as well. The next question, what would help make today's lesson more effective? So this is a constructive feedback that we have that we can get from a student in a descriptive mode where the student is free to write her long answers. Long answer feedbacks are usually very helpful, but then it is difficult to consolidate is what all of us know. But now let's see how we can do it effectively using exit tickets. Every question here has many other options that you can explore. For example, here you can make this question mandatory by clicking on this required button. So you can click on this required button once. When it becomes green, it means the student has to answer this question for sure. It becomes a mandatory question to answer. To delete one question from the Google form, you click on this delete question option. Okay. To add a new question to this form, you can click on this add question button. Alright, so there are many other buttons which you can explore. So title and description, importing questions. So there are many other options. You can also add images to your questions, add video to a question and also you can add new sections to the questionnaire. So in an exit ticket, it's always essential that we keep the number of questions lesser And also we give students a minimal effort should be required to fill in the exit ticket so that they do not feel burdened when they fill the questionnaire. So we'll keep only minimum number of questions and then we'll now we'll have to give it to the students. So how do we do that? Before sharing it to the students, we need to check the settings for this form. Now this Google form should not be a quiz. So this is deselected and when it comes to responses, usually for feedbacks, it is a good idea not to give email addresses. But if you would like to have the email addresses, you can say verified input and also say send response responders a copy of their response. If you would like to have your students a copy, then you can say when requested, give them a response. Allow response editing. When should we actually allow this? If you think that your students can edit the Google form after they submit, they fill in some answers to each question and they click submit. After submitting, they think that some question can be modified. Then you need to select this button. I would like to keep this open for one full day and then close it. Next, I would like to limit this response to one. Why each student can submit this Google form only once? This is what I want. So I will click on this as well. So these are the most important things that you should be thinking about. So first is the questions. Then we came to the settings tab to check the settings. And now it is time for us to share it with our students. How do we share this with our students? To share a Google form to the students, we have to publish it. So click on the publish button here. Now when we are publishing, we need to inform whether our responders can be anybody or are we going to restrict the responses. So here anyone with link, I'll manage. And now look at this. Editor view is restricted. Responders view anyone with the link can respond. I am OK with these permissions. So editor only I can edit, but responder we can have. Anyone with the link can respond. Done. So I have checked it. Now after checking this, I have to publish. Now I have published my Google form. When I have published my Google form, it is ready to take responses. Look at the responses tab. Here it says waiting for responses. Now we'll go to this button. Look at this. This is a link icon. You click on this copy responders link. You shorten the URL. And then you say copy. This copied link can be pasted in your WhatsApp group, student WhatsApp group, or you can paste it in any of your LMS learning management system. If you are using Moodle or Google Classroom, wherever you want, you can share this link with the students immediately after the class to collect the responses. So let me give you a quick preview of how the students will be able to see your responses. For students to see your responses, you need to click on this preview button. Now look at the preview. This is how it will look for a student. Before you leave class today, answer the following question. So I should answer all these two questions. A student should answer all these questions and the student should submit it. Now let's say I don't like this color or I want to change something here. Then I should go back, close the preview and edit mode. Then I can see the palette here. Customize thing. This is a palette icon which says customize the click on that. And here you can see the text. You can change the text here and you can change the question text here. Then you can change. You can change text here and you can change the colors here. Look at this. You have color palette where you can change the colors. You can say plus and here you have white range of colors. OK. You have lots of colors and if you wish to change, you can change that. So your color palette is also useful. Then you can look at the preview. Then you can decide on whether you have to change or keep it as it is. Now copy responders link. Then you can copy it from here and then use it on your elements. Let me now show you how we can use the data that we collect using the exit ticket. This exit ticket I have just created and so I don't have any responses to the exit ticket. I shall show you one exit ticket where I already have some data. So I will click on this purple icon one time to reach the home page of Google Forms. Once I click this, I will see all the Google Forms that I have created earlier. Let me check which Google Form has some responses. Yes, this Google Form of mine, this exit ticket of mine has some responses. Let's see how I can extract data from this and derive meaning out of it. So you are on the questions tab. You can see a few questions here on this form. So these are the questions that are available. One, two, three questions are there. And so I'm going to responses. In responses tab, you will see first tab, which is a summary tab. So on the summary tab, you will see question by question. The first question name has 39 responses. The second question email has 37 responses. The third question, what's one important thing you learned in today's class has 38 responses. Each of the response is actually listed one below the other. As you see here, so this is present in the summary tab. When you go to the question tab, you will be able to see each of the questions one by one. So you have a total of five questions. The first question is name. Okay. And the second question is email. If you say email, then you will see one response. Everyone's email response you can see. Similarly, if you go to the third question, you will be able to see answer of every person to the third question. So this is how it works. In the question tab, you are able to see response of each student question by question. Now go to individual tab. In individual tab, you will be able to see response from each student. Means in one page of this response, you will be able to see response of one student. Let's say here the name of the student is Rohit. His email id, his answer to the first question, his answer to the second question and the third question all appear on the same page. This is how responses are shown. Now let us look at how to use this data. Now to use this data, I'll go to view in sheets. Now look at how it is viewed. Okay. It has opened my responses on a Google sheet. Now you are seeing the five different questions along with one additional column which is called timestamp. So this timestamp actually holds the time at which the Google form is submitted. So the Google form is submitted at 10, 26, 51 seconds. So it is HHMMSS. So now we have all the answers also on this Google sheet. Now how do I consolidate? Let's say I have some 100 or 150 students in my class and I have got this data. I'm a teacher who is interested to read all their answers. Yes, go ahead. I can sit and read all the answers. Do we have that time to do it every day for every class? Let's say on an average we have two to three classes per day and then you will have to look at 150 into three classes. You will have to look at too many answers. You will not have that time. And it is very important that we understand what our students have understood from the previous class to go on to the next class. Yes, let us now look at how we'll do that. Go to file, choose download and now download your data as an Excel sheet. Click on Excel. Now you will be able to see the Excel sheet exit ticket responses. I'm going to store it as exit ticket responses in my downloads folder. As soon as I download here, I can now open the responses. Okay, so sorry, I can actually see the responses in my downloads folder. Now I'll open chat GPT. Chat GPT is one of the commonly used LLMs, large language models. Now in chat GPT, what I am going to ask chat GPT, I'm going to tell chat GPT, assume you are a, let me enlarge the screen so that it is easily visible. Assume you are a teacher. You have completed your class on exit ticket and you would like to, and you have collected your student feedback on a Google Form exit ticket, Google Forms exit ticket. Now check the attached response sheet to answer the questions that I ask you. I want to understand my students' perspective before I handle the next session. Now I'm going to ask questions to chat GPT. I will attach this file, exit ticket responses. Open. To attach the file, I clicked on the plus icon. After I click on the plus icon, I selected the file. After selecting the file and click open, it gets attached. Now you need to click this arrow. Now chat GPT says, I'll analyze the exit ticket responses and summarize key insights. Let me process the file and extract useful information. File contains a sheet named, so it is now trying to rephrase what all it has done. I've extracted the key columns from the exit ticket responses. Students mentioned learning about new uses and it tries to summarize whatever it has seen there. As for the lesson, most of the students felt prepared with responses like yes, yes, definitely. While one mentioned no. Suggestions for improvement. Students engaged. Suggested hands-on sessions using Colab and providing more clarity in explanations. So these are some of the summarized views. Now I can again ask chat GPT more questions on this. How do I ask more questions on this? Let's see. I would like to know what percentage of students are happy with my class. This is the next question. 69.2% of the students felt prepared and happy with your class. Let me know if you need a deeper analysis. Yes. I would like to know if my class was engaging enough for my students. Very interesting. I can ask any question to chat GPT now. The 97.4% of students mentioned a key takeaway from the class. Indicating high engagement. This suggests that most students found the session meaningful and actively participated. Like say yes chat GPT is ready to take more questions from you. Now that you see that your students have understood the class, you can actually you are well prepared to take up the next session. Hope you enjoyed the session. Thank you all. See you in the next session.",
  "chunks": [
    {
      "timestamp": [
        0.0,
        20.82
      ],
      "text": " Hello everyone, this is Meenakshi, research scholar at IIT, Roper."
    },
    {
      "timestamp": [
        20.82,
        29.96
      ],
      "text": " In this session, let us look at Exit Ticket, your shortcut to unravel student understanding."
    },
    {
      "timestamp": [
        29.96,
        36.72
      ],
      "text": " Let us take a classroom where the teacher has just finished his class and is leaving the classroom."
    },
    {
      "timestamp": [
        36.72,
        39.88
      ],
      "text": " Students are leaving the classroom."
    },
    {
      "timestamp": [
        39.88,
        47.519999999999996
      ],
      "text": " Have you ever wondered how you could measure your students understood your lecture?"
    },
    {
      "timestamp": [
        47.519999999999996,
        52.72
      ],
      "text": " What if there was a simple yet powerful way to bridge today's learning of students with"
    },
    {
      "timestamp": [
        52.72,
        55.24
      ],
      "text": " tomorrow's lesson?"
    },
    {
      "timestamp": [
        55.24,
        65.4
      ],
      "text": " Welcome to Exit Tickets, a quick and effective method to gather students feedback and refine your teaching."
    },
    {
      "timestamp": [
        65.4,
        67.52000000000001
      ],
      "text": " Let us look at this classroom."
    },
    {
      "timestamp": [
        67.52000000000001,
        70.56
      ],
      "text": " Here the teacher tries to collect feedback."
    },
    {
      "timestamp": [
        70.56,
        73.28
      ],
      "text": " The teacher collects handwritten feedbacks."
    },
    {
      "timestamp": [
        73.28,
        77.2
      ],
      "text": " Yes, it is good to collect feedback from students."
    },
    {
      "timestamp": [
        77.2,
        81.9
      ],
      "text": " Let's say you have a classroom of 100 or 200 students."
    },
    {
      "timestamp": [
        81.9,
        84.2
      ],
      "text": " How do you collect all the feedback?"
    },
    {
      "timestamp": [
        84.24000000000001,
        90.8
      ],
      "text": " Yes, you collect it written in papers and now you have a pile of papers."
    },
    {
      "timestamp": [
        90.8,
        95.88
      ],
      "text": " Will you be able to value all the papers before tomorrow's class?"
    },
    {
      "timestamp": [
        95.88,
        101.76
      ],
      "text": " Yes, this is a challenging question to answer."
    },
    {
      "timestamp": [
        101.76,
        103.44
      ],
      "text": " Let's look at this."
    },
    {
      "timestamp": [
        103.44,
        107.96000000000001
      ],
      "text": " Here the teacher actually collects exit tickets."
    },
    {
      "timestamp": [
        107.96,
        115.03999999999999
      ],
      "text": " Exit tickets are short structured reflections students complete at the end of a session."
    },
    {
      "timestamp": [
        115.03999999999999,
        121.36
      ],
      "text": " These actually help educators assess the comprehension and address gaps and tailor the next lesson"
    },
    {
      "timestamp": [
        121.36,
        122.36
      ],
      "text": " effectively."
    },
    {
      "timestamp": [
        122.36,
        128.79999999999998
      ],
      "text": " How is this advantageous than the paper feedback that the previous teacher collected?"
    },
    {
      "timestamp": [
        128.79999999999998,
        135.92
      ],
      "text": " This is because this teacher finds it very easy to comprehend and analyze the feedback"
    },
    {
      "timestamp": [
        135.92,
        140.23999999999998
      ],
      "text": " given by students although there is a huge number of feedbacks here."
    },
    {
      "timestamp": [
        140.23999999999998,
        145.64
      ],
      "text": " What are these exit tickets?"
    },
    {
      "timestamp": [
        145.64,
        147.95999999999998
      ],
      "text": " Exit tickets can take various forms."
    },
    {
      "timestamp": [
        147.95999999999998,
        154.76
      ],
      "text": " A simple question like what was the most important thing that you learned today or on a rating"
    },
    {
      "timestamp": [
        154.76,
        158.07999999999998
      ],
      "text": " of how confident you feel about the topic."
    },
    {
      "timestamp": [
        158.07999999999998,
        164.64
      ],
      "text": " So a very simple question can give you a good idea of whether the student has actually understood"
    },
    {
      "timestamp": [
        164.67999999999998,
        165.67999999999998
      ],
      "text": " the concept."
    },
    {
      "timestamp": [
        165.67999999999998,
        168.07999999999998
      ],
      "text": " The student is confident about the concept."
    },
    {
      "timestamp": [
        168.07999999999998,
        173.76
      ],
      "text": " Whether you will have to brush up the concept a little more in the next class before diving"
    },
    {
      "timestamp": [
        173.76,
        178.6
      ],
      "text": " into the deeper into the concept."
    },
    {
      "timestamp": [
        178.6,
        184.48
      ],
      "text": " Let us try creating a Google form for exit tickets."
    },
    {
      "timestamp": [
        184.48,
        189.44
      ],
      "text": " So to create a Google form, we need to open the Google forms site."
    },
    {
      "timestamp": [
        189.48,
        198.28
      ],
      "text": " I opened Google and type Google forms."
    },
    {
      "timestamp": [
        198.28,
        199.28
      ],
      "text": " Google forms sign in."
    },
    {
      "timestamp": [
        199.28,
        211.88
      ],
      "text": " Now here when the forms site opens, you will see forms.google.com open and here you are"
    },
    {
      "timestamp": [
        211.88,
        215.76
      ],
      "text": " seeing a template which is called exit ticket."
    },
    {
      "timestamp": [
        215.84,
        218.67999999999998
      ],
      "text": " Click on the template to open it."
    },
    {
      "timestamp": [
        218.67999999999998,
        230.88
      ],
      "text": " As you are seeing, this is a Google form which is already populated."
    },
    {
      "timestamp": [
        230.88,
        236.23999999999998
      ],
      "text": " Some of you might be aware of this Google forms, but here exit ticket is a specific"
    },
    {
      "timestamp": [
        236.23999999999998,
        243.0
      ],
      "text": " template of the Google form which helps us to collect feedback of students or any learners"
    },
    {
      "timestamp": [
        243.0,
        245.35999999999999
      ],
      "text": " immediately after a session."
    },
    {
      "timestamp": [
        245.36,
        252.04000000000002
      ],
      "text": " We call it an exit ticket because when the students leave a classroom, they would have"
    },
    {
      "timestamp": [
        252.04000000000002,
        257.36
      ],
      "text": " to fill in a form based on their understanding of the classroom lectures."
    },
    {
      "timestamp": [
        257.36,
        260.52000000000004
      ],
      "text": " Let us take a look at the template design."
    },
    {
      "timestamp": [
        260.52000000000004,
        268.24
      ],
      "text": " First it says exit ticket and we have the name as the first question here."
    },
    {
      "timestamp": [
        268.24,
        272.44
      ],
      "text": " Second we also collect the email ID of the students."
    },
    {
      "timestamp": [
        272.52,
        278.64
      ],
      "text": " Here what you see is what's one important thing you learn in today's class."
    },
    {
      "timestamp": [
        278.64,
        287.76
      ],
      "text": " Okay, so you can also double click it to change the question a little bit."
    },
    {
      "timestamp": [
        287.76,
        300.15999999999997
      ],
      "text": " Mention two concepts that you remember from today's session."
    },
    {
      "timestamp": [
        300.16,
        305.24
      ],
      "text": " So you can write your own question, just double click to edit the questions."
    },
    {
      "timestamp": [
        305.24,
        310.96000000000004
      ],
      "text": " After you type the question, click outside the form so that you save this question."
    },
    {
      "timestamp": [
        310.96000000000004,
        312.96000000000004
      ],
      "text": " It immediately gets saved."
    },
    {
      "timestamp": [
        312.96000000000004,
        316.88
      ],
      "text": " Now did you feel prepared for today's lesson?"
    },
    {
      "timestamp": [
        316.88,
        319.28000000000003
      ],
      "text": " Why or why not?"
    },
    {
      "timestamp": [
        319.28000000000003,
        321.12
      ],
      "text": " So why do we ask this question?"
    },
    {
      "timestamp": [
        321.12,
        327.56
      ],
      "text": " We have to ask this question because we need to know if the student has come with the prerequisites"
    },
    {
      "timestamp": [
        327.56,
        328.56
      ],
      "text": " for the class."
    },
    {
      "timestamp": [
        328.96,
        334.36
      ],
      "text": " Let's say you have already told your students to revise differential calculus for the class"
    },
    {
      "timestamp": [
        334.36,
        339.0
      ],
      "text": " or you want them to come up with some reading material, complete the reading material and"
    },
    {
      "timestamp": [
        339.0,
        340.0
      ],
      "text": " come."
    },
    {
      "timestamp": [
        340.0,
        344.92
      ],
      "text": " So we need to also know whether the student came to the class well prepared or not."
    },
    {
      "timestamp": [
        344.92,
        346.88
      ],
      "text": " So this is another question that can be asked."
    },
    {
      "timestamp": [
        346.88,
        352.68
      ],
      "text": " Anyways, you have an option of double clicking and then you can edit the question as well."
    },
    {
      "timestamp": [
        352.68,
        357.04
      ],
      "text": " The next question, what would help make today's lesson more effective?"
    },
    {
      "timestamp": [
        357.52000000000004,
        362.84000000000003
      ],
      "text": " So this is a constructive feedback that we have that we can get from a student in a descriptive"
    },
    {
      "timestamp": [
        362.84000000000003,
        366.76000000000005
      ],
      "text": " mode where the student is free to write her long answers."
    },
    {
      "timestamp": [
        366.76000000000005,
        371.72
      ],
      "text": " Long answer feedbacks are usually very helpful, but then it is difficult to consolidate is"
    },
    {
      "timestamp": [
        371.72,
        373.36
      ],
      "text": " what all of us know."
    },
    {
      "timestamp": [
        373.36,
        379.8
      ],
      "text": " But now let's see how we can do it effectively using exit tickets."
    },
    {
      "timestamp": [
        379.8,
        384.68
      ],
      "text": " Every question here has many other options that you can explore."
    },
    {
      "timestamp": [
        384.68,
        392.0
      ],
      "text": " For example, here you can make this question mandatory by clicking on this required button."
    },
    {
      "timestamp": [
        392.0,
        394.56
      ],
      "text": " So you can click on this required button once."
    },
    {
      "timestamp": [
        394.56,
        399.92
      ],
      "text": " When it becomes green, it means the student has to answer this question for sure."
    },
    {
      "timestamp": [
        399.92,
        402.96000000000004
      ],
      "text": " It becomes a mandatory question to answer."
    },
    {
      "timestamp": [
        402.96000000000004,
        407.24
      ],
      "text": " To delete one question from the Google form, you click on this delete question option."
    },
    {
      "timestamp": [
        407.24,
        408.24
      ],
      "text": " Okay."
    },
    {
      "timestamp": [
        408.24,
        413.56
      ],
      "text": " To add a new question to this form, you can click on this add question button."
    },
    {
      "timestamp": [
        414.12,
        419.04
      ],
      "text": " Alright, so there are many other buttons which you can explore."
    },
    {
      "timestamp": [
        419.04,
        422.42
      ],
      "text": " So title and description, importing questions."
    },
    {
      "timestamp": [
        422.42,
        423.88
      ],
      "text": " So there are many other options."
    },
    {
      "timestamp": [
        423.88,
        429.48
      ],
      "text": " You can also add images to your questions, add video to a question and also you can add"
    },
    {
      "timestamp": [
        429.48,
        431.74
      ],
      "text": " new sections to the questionnaire."
    },
    {
      "timestamp": [
        431.74,
        439.2
      ],
      "text": " So in an exit ticket, it's always essential that we keep the number of questions lesser"
    },
    {
      "timestamp": [
        439.32,
        445.64
      ],
      "text": " And also we give students a minimal effort should be required to fill in the exit ticket"
    },
    {
      "timestamp": [
        445.64,
        450.36
      ],
      "text": " so that they do not feel burdened when they fill the questionnaire."
    },
    {
      "timestamp": [
        450.36,
        456.52
      ],
      "text": " So we'll keep only minimum number of questions and then we'll now we'll have to give it to"
    },
    {
      "timestamp": [
        456.52,
        457.76
      ],
      "text": " the students."
    },
    {
      "timestamp": [
        457.76,
        459.08
      ],
      "text": " So how do we do that?"
    },
    {
      "timestamp": [
        459.08,
        465.26
      ],
      "text": " Before sharing it to the students, we need to check the settings for this form."
    },
    {
      "timestamp": [
        465.26,
        468.28
      ],
      "text": " Now this Google form should not be a quiz."
    },
    {
      "timestamp": [
        468.32,
        474.64
      ],
      "text": " So this is deselected and when it comes to responses, usually for feedbacks, it is a"
    },
    {
      "timestamp": [
        474.64,
        477.17999999999995
      ],
      "text": " good idea not to give email addresses."
    },
    {
      "timestamp": [
        477.17999999999995,
        484.35999999999996
      ],
      "text": " But if you would like to have the email addresses, you can say verified input and also say send"
    },
    {
      "timestamp": [
        484.35999999999996,
        487.46
      ],
      "text": " response responders a copy of their response."
    },
    {
      "timestamp": [
        487.46,
        491.28
      ],
      "text": " If you would like to have your students a copy, then you can say when requested, give"
    },
    {
      "timestamp": [
        491.28,
        493.4
      ],
      "text": " them a response."
    },
    {
      "timestamp": [
        493.4,
        494.79999999999995
      ],
      "text": " Allow response editing."
    },
    {
      "timestamp": [
        494.79999999999995,
        497.79999999999995
      ],
      "text": " When should we actually allow this?"
    },
    {
      "timestamp": [
        497.8,
        503.12
      ],
      "text": " If you think that your students can edit the Google form after they submit, they fill"
    },
    {
      "timestamp": [
        503.12,
        507.84000000000003
      ],
      "text": " in some answers to each question and they click submit."
    },
    {
      "timestamp": [
        507.84000000000003,
        512.22
      ],
      "text": " After submitting, they think that some question can be modified."
    },
    {
      "timestamp": [
        512.22,
        515.0600000000001
      ],
      "text": " Then you need to select this button."
    },
    {
      "timestamp": [
        515.0600000000001,
        519.32
      ],
      "text": " I would like to keep this open for one full day and then close it."
    },
    {
      "timestamp": [
        519.32,
        522.92
      ],
      "text": " Next, I would like to limit this response to one."
    },
    {
      "timestamp": [
        522.92,
        526.96
      ],
      "text": " Why each student can submit this Google form only once?"
    },
    {
      "timestamp": [
        527.12,
        528.48
      ],
      "text": " This is what I want."
    },
    {
      "timestamp": [
        528.48,
        531.6800000000001
      ],
      "text": " So I will click on this as well."
    },
    {
      "timestamp": [
        531.6800000000001,
        536.08
      ],
      "text": " So these are the most important things that you should be thinking about."
    },
    {
      "timestamp": [
        536.08,
        538.08
      ],
      "text": " So first is the questions."
    },
    {
      "timestamp": [
        538.08,
        541.48
      ],
      "text": " Then we came to the settings tab to check the settings."
    },
    {
      "timestamp": [
        541.48,
        546.44
      ],
      "text": " And now it is time for us to share it with our students."
    },
    {
      "timestamp": [
        546.44,
        548.8000000000001
      ],
      "text": " How do we share this with our students?"
    },
    {
      "timestamp": [
        548.8000000000001,
        553.84
      ],
      "text": " To share a Google form to the students, we have to publish it."
    },
    {
      "timestamp": [
        553.84,
        557.44
      ],
      "text": " So click on the publish button here."
    },
    {
      "timestamp": [
        557.44,
        565.5600000000001
      ],
      "text": " Now when we are publishing, we need to inform whether our responders can be anybody or are"
    },
    {
      "timestamp": [
        565.5600000000001,
        570.76
      ],
      "text": " we going to restrict the responses."
    },
    {
      "timestamp": [
        570.76,
        573.8000000000001
      ],
      "text": " So here anyone with link, I'll manage."
    },
    {
      "timestamp": [
        573.8000000000001,
        575.72
      ],
      "text": " And now look at this."
    },
    {
      "timestamp": [
        575.72,
        578.4200000000001
      ],
      "text": " Editor view is restricted."
    },
    {
      "timestamp": [
        578.4200000000001,
        581.72
      ],
      "text": " Responders view anyone with the link can respond."
    },
    {
      "timestamp": [
        581.72,
        584.24
      ],
      "text": " I am OK with these permissions."
    },
    {
      "timestamp": [
        584.24,
        589.08
      ],
      "text": " So editor only I can edit, but responder we can have."
    },
    {
      "timestamp": [
        589.08,
        590.76
      ],
      "text": " Anyone with the link can respond."
    },
    {
      "timestamp": [
        590.76,
        591.76
      ],
      "text": " Done."
    },
    {
      "timestamp": [
        591.76,
        593.28
      ],
      "text": " So I have checked it."
    },
    {
      "timestamp": [
        593.28,
        597.0400000000001
      ],
      "text": " Now after checking this, I have to publish."
    },
    {
      "timestamp": [
        597.0400000000001,
        599.36
      ],
      "text": " Now I have published my Google form."
    },
    {
      "timestamp": [
        599.36,
        605.1600000000001
      ],
      "text": " When I have published my Google form, it is ready to take responses."
    },
    {
      "timestamp": [
        605.1600000000001,
        607.32
      ],
      "text": " Look at the responses tab."
    },
    {
      "timestamp": [
        607.32,
        610.5600000000001
      ],
      "text": " Here it says waiting for responses."
    },
    {
      "timestamp": [
        610.56,
        613.64
      ],
      "text": " Now we'll go to this button."
    },
    {
      "timestamp": [
        613.64,
        614.64
      ],
      "text": " Look at this."
    },
    {
      "timestamp": [
        614.64,
        616.0799999999999
      ],
      "text": " This is a link icon."
    },
    {
      "timestamp": [
        616.0799999999999,
        620.9799999999999
      ],
      "text": " You click on this copy responders link."
    },
    {
      "timestamp": [
        620.9799999999999,
        624.5799999999999
      ],
      "text": " You shorten the URL."
    },
    {
      "timestamp": [
        624.5799999999999,
        627.06
      ],
      "text": " And then you say copy."
    },
    {
      "timestamp": [
        627.06,
        633.92
      ],
      "text": " This copied link can be pasted in your WhatsApp group, student WhatsApp group, or you can"
    },
    {
      "timestamp": [
        633.92,
        638.0799999999999
      ],
      "text": " paste it in any of your LMS learning management system."
    },
    {
      "timestamp": [
        638.08,
        643.08
      ],
      "text": " If you are using Moodle or Google Classroom, wherever you want, you can share this link"
    },
    {
      "timestamp": [
        643.08,
        648.8000000000001
      ],
      "text": " with the students immediately after the class to collect the responses."
    },
    {
      "timestamp": [
        648.8000000000001,
        656.8000000000001
      ],
      "text": " So let me give you a quick preview of how the students will be able to see your responses."
    },
    {
      "timestamp": [
        656.8000000000001,
        663.76
      ],
      "text": " For students to see your responses, you need to click on this preview button."
    },
    {
      "timestamp": [
        663.76,
        665.32
      ],
      "text": " Now look at the preview."
    },
    {
      "timestamp": [
        665.32,
        667.88
      ],
      "text": " This is how it will look for a student."
    },
    {
      "timestamp": [
        667.88,
        671.5400000000001
      ],
      "text": " Before you leave class today, answer the following question."
    },
    {
      "timestamp": [
        671.5400000000001,
        674.0400000000001
      ],
      "text": " So I should answer all these two questions."
    },
    {
      "timestamp": [
        674.0400000000001,
        678.8000000000001
      ],
      "text": " A student should answer all these questions and the student should submit it."
    },
    {
      "timestamp": [
        678.8000000000001,
        683.8000000000001
      ],
      "text": " Now let's say I don't like this color or I want to change something here."
    },
    {
      "timestamp": [
        683.8000000000001,
        690.24
      ],
      "text": " Then I should go back, close the preview and edit mode."
    },
    {
      "timestamp": [
        690.24,
        692.6400000000001
      ],
      "text": " Then I can see the palette here."
    },
    {
      "timestamp": [
        692.6400000000001,
        693.9000000000001
      ],
      "text": " Customize thing."
    },
    {
      "timestamp": [
        693.9,
        698.9399999999999
      ],
      "text": " This is a palette icon which says customize the click on that."
    },
    {
      "timestamp": [
        698.9399999999999,
        700.98
      ],
      "text": " And here you can see the text."
    },
    {
      "timestamp": [
        700.98,
        706.62
      ],
      "text": " You can change the text here and you can change the question text here."
    },
    {
      "timestamp": [
        706.62,
        709.72
      ],
      "text": " Then you can change."
    },
    {
      "timestamp": [
        709.72,
        713.6999999999999
      ],
      "text": " You can change text here and you can change the colors here."
    },
    {
      "timestamp": [
        713.6999999999999,
        714.6999999999999
      ],
      "text": " Look at this."
    },
    {
      "timestamp": [
        714.6999999999999,
        717.98
      ],
      "text": " You have color palette where you can change the colors."
    },
    {
      "timestamp": [
        717.98,
        722.34
      ],
      "text": " You can say plus and here you have white range of colors."
    },
    {
      "timestamp": [
        722.34,
        723.46
      ],
      "text": " OK."
    },
    {
      "timestamp": [
        723.46,
        728.4000000000001
      ],
      "text": " You have lots of colors and if you wish to change, you can change that."
    },
    {
      "timestamp": [
        728.4000000000001,
        732.6600000000001
      ],
      "text": " So your color palette is also useful."
    },
    {
      "timestamp": [
        732.6600000000001,
        734.5400000000001
      ],
      "text": " Then you can look at the preview."
    },
    {
      "timestamp": [
        734.5400000000001,
        740.7800000000001
      ],
      "text": " Then you can decide on whether you have to change or keep it as it is."
    },
    {
      "timestamp": [
        740.7800000000001,
        742.94
      ],
      "text": " Now copy responders link."
    },
    {
      "timestamp": [
        742.94,
        749.02
      ],
      "text": " Then you can copy it from here and then use it on your elements."
    },
    {
      "timestamp": [
        749.02,
        756.36
      ],
      "text": " Let me now show you how we can use the data that we collect using the exit ticket."
    },
    {
      "timestamp": [
        756.36,
        762.52
      ],
      "text": " This exit ticket I have just created and so I don't have any responses to the exit ticket."
    },
    {
      "timestamp": [
        762.52,
        769.68
      ],
      "text": " I shall show you one exit ticket where I already have some data."
    },
    {
      "timestamp": [
        769.68,
        776.22
      ],
      "text": " So I will click on this purple icon one time to reach the home page of Google Forms."
    },
    {
      "timestamp": [
        776.26,
        784.5400000000001
      ],
      "text": " Once I click this, I will see all the Google Forms that I have created earlier."
    },
    {
      "timestamp": [
        784.5400000000001,
        788.22
      ],
      "text": " Let me check which Google Form has some responses."
    },
    {
      "timestamp": [
        788.22,
        794.58
      ],
      "text": " Yes, this Google Form of mine, this exit ticket of mine has some responses."
    },
    {
      "timestamp": [
        794.58,
        800.4200000000001
      ],
      "text": " Let's see how I can extract data from this and derive meaning out of it."
    },
    {
      "timestamp": [
        800.4200000000001,
        803.08
      ],
      "text": " So you are on the questions tab."
    },
    {
      "timestamp": [
        803.08,
        806.74
      ],
      "text": " You can see a few questions here on this form."
    },
    {
      "timestamp": [
        806.74,
        809.6
      ],
      "text": " So these are the questions that are available."
    },
    {
      "timestamp": [
        809.6,
        812.6800000000001
      ],
      "text": " One, two, three questions are there."
    },
    {
      "timestamp": [
        812.6800000000001,
        814.96
      ],
      "text": " And so I'm going to responses."
    },
    {
      "timestamp": [
        814.96,
        821.0400000000001
      ],
      "text": " In responses tab, you will see first tab, which is a summary tab."
    },
    {
      "timestamp": [
        821.0400000000001,
        826.26
      ],
      "text": " So on the summary tab, you will see question by question."
    },
    {
      "timestamp": [
        826.26,
        830.24
      ],
      "text": " The first question name has 39 responses."
    },
    {
      "timestamp": [
        830.24,
        834.5600000000001
      ],
      "text": " The second question email has 37 responses."
    },
    {
      "timestamp": [
        834.5600000000001,
        841.92
      ],
      "text": " The third question, what's one important thing you learned in today's class has 38 responses."
    },
    {
      "timestamp": [
        841.92,
        848.6800000000001
      ],
      "text": " Each of the response is actually listed one below the other."
    },
    {
      "timestamp": [
        848.6800000000001,
        853.08
      ],
      "text": " As you see here, so this is present in the summary tab."
    },
    {
      "timestamp": [
        853.08,
        858.58
      ],
      "text": " When you go to the question tab, you will be able to see each of the questions one by"
    },
    {
      "timestamp": [
        858.58,
        859.58
      ],
      "text": " one."
    },
    {
      "timestamp": [
        859.7,
        862.26
      ],
      "text": " So you have a total of five questions."
    },
    {
      "timestamp": [
        862.26,
        864.7800000000001
      ],
      "text": " The first question is name."
    },
    {
      "timestamp": [
        864.7800000000001,
        865.7800000000001
      ],
      "text": " Okay."
    },
    {
      "timestamp": [
        865.7800000000001,
        869.3000000000001
      ],
      "text": " And the second question is email."
    },
    {
      "timestamp": [
        869.3000000000001,
        873.26
      ],
      "text": " If you say email, then you will see one response."
    },
    {
      "timestamp": [
        873.26,
        876.1800000000001
      ],
      "text": " Everyone's email response you can see."
    },
    {
      "timestamp": [
        876.1800000000001,
        882.74
      ],
      "text": " Similarly, if you go to the third question, you will be able to see answer of every person"
    },
    {
      "timestamp": [
        882.74,
        884.9000000000001
      ],
      "text": " to the third question."
    },
    {
      "timestamp": [
        884.9000000000001,
        887.62
      ],
      "text": " So this is how it works."
    },
    {
      "timestamp": [
        887.62,
        894.7
      ],
      "text": " In the question tab, you are able to see response of each student question by question."
    },
    {
      "timestamp": [
        894.7,
        896.58
      ],
      "text": " Now go to individual tab."
    },
    {
      "timestamp": [
        896.58,
        902.42
      ],
      "text": " In individual tab, you will be able to see response from each student."
    },
    {
      "timestamp": [
        902.42,
        909.0600000000001
      ],
      "text": " Means in one page of this response, you will be able to see response of one student."
    },
    {
      "timestamp": [
        909.0600000000001,
        911.94
      ],
      "text": " Let's say here the name of the student is Rohit."
    },
    {
      "timestamp": [
        911.94,
        917.7800000000001
      ],
      "text": " His email id, his answer to the first question, his answer to the second question and the"
    },
    {
      "timestamp": [
        917.7800000000001,
        921.3000000000001
      ],
      "text": " third question all appear on the same page."
    },
    {
      "timestamp": [
        921.3000000000001,
        924.5
      ],
      "text": " This is how responses are shown."
    },
    {
      "timestamp": [
        924.5,
        929.0600000000001
      ],
      "text": " Now let us look at how to use this data."
    },
    {
      "timestamp": [
        929.0600000000001,
        936.86
      ],
      "text": " Now to use this data, I'll go to view in sheets."
    },
    {
      "timestamp": [
        936.86,
        938.98
      ],
      "text": " Now look at how it is viewed."
    },
    {
      "timestamp": [
        938.98,
        939.98
      ],
      "text": " Okay."
    },
    {
      "timestamp": [
        939.98,
        945.5
      ],
      "text": " It has opened my responses on a Google sheet."
    },
    {
      "timestamp": [
        945.5,
        951.38
      ],
      "text": " Now you are seeing the five different questions along with one additional column which is"
    },
    {
      "timestamp": [
        951.38,
        953.26
      ],
      "text": " called timestamp."
    },
    {
      "timestamp": [
        953.26,
        959.58
      ],
      "text": " So this timestamp actually holds the time at which the Google form is submitted."
    },
    {
      "timestamp": [
        959.58,
        965.34
      ],
      "text": " So the Google form is submitted at 10, 26, 51 seconds."
    },
    {
      "timestamp": [
        965.34,
        968.34
      ],
      "text": " So it is HHMMSS."
    },
    {
      "timestamp": [
        968.34,
        974.74
      ],
      "text": " So now we have all the answers also on this Google sheet."
    },
    {
      "timestamp": [
        974.74,
        976.86
      ],
      "text": " Now how do I consolidate?"
    },
    {
      "timestamp": [
        976.86,
        982.7
      ],
      "text": " Let's say I have some 100 or 150 students in my class and I have got this data."
    },
    {
      "timestamp": [
        982.7,
        985.7800000000001
      ],
      "text": " I'm a teacher who is interested to read all their answers."
    },
    {
      "timestamp": [
        985.7800000000001,
        986.7800000000001
      ],
      "text": " Yes, go ahead."
    },
    {
      "timestamp": [
        986.7800000000001,
        988.94
      ],
      "text": " I can sit and read all the answers."
    },
    {
      "timestamp": [
        988.94,
        993.94
      ],
      "text": " Do we have that time to do it every day for every class?"
    },
    {
      "timestamp": [
        994.4200000000001,
        998.3800000000001
      ],
      "text": " Let's say on an average we have two to three classes per day and then you will have to"
    },
    {
      "timestamp": [
        998.3800000000001,
        1001.6600000000001
      ],
      "text": " look at 150 into three classes."
    },
    {
      "timestamp": [
        1001.6600000000001,
        1003.84
      ],
      "text": " You will have to look at too many answers."
    },
    {
      "timestamp": [
        1003.84,
        1005.5400000000001
      ],
      "text": " You will not have that time."
    },
    {
      "timestamp": [
        1005.5400000000001,
        1010.34
      ],
      "text": " And it is very important that we understand what our students have understood from the"
    },
    {
      "timestamp": [
        1010.34,
        1013.1
      ],
      "text": " previous class to go on to the next class."
    },
    {
      "timestamp": [
        1013.1,
        1016.58
      ],
      "text": " Yes, let us now look at how we'll do that."
    },
    {
      "timestamp": [
        1016.58,
        1026.1000000000001
      ],
      "text": " Go to file, choose download and now download your data as an Excel sheet."
    },
    {
      "timestamp": [
        1026.1000000000001,
        1029.26
      ],
      "text": " Click on Excel."
    },
    {
      "timestamp": [
        1029.26,
        1035.14
      ],
      "text": " Now you will be able to see the Excel sheet exit ticket responses."
    },
    {
      "timestamp": [
        1035.14,
        1041.46
      ],
      "text": " I'm going to store it as exit ticket responses in my downloads folder."
    },
    {
      "timestamp": [
        1041.46,
        1046.06
      ],
      "text": " As soon as I download here, I can now open the responses."
    },
    {
      "timestamp": [
        1046.06,
        1052.1000000000001
      ],
      "text": " Okay, so sorry, I can actually see the responses in my downloads folder."
    },
    {
      "timestamp": [
        1052.1000000000001,
        1055.22
      ],
      "text": " Now I'll open chat GPT."
    },
    {
      "timestamp": [
        1055.22,
        1062.22
      ],
      "text": " Chat GPT is one of the commonly used LLMs, large language models."
    },
    {
      "timestamp": [
        1062.22,
        1070.96
      ],
      "text": " Now in chat GPT, what I am going to ask chat GPT, I'm going to tell chat GPT, assume you"
    },
    {
      "timestamp": [
        1070.96,
        1080.08
      ],
      "text": " are a, let me enlarge the screen so that it is easily visible."
    },
    {
      "timestamp": [
        1080.08,
        1086.3400000000001
      ],
      "text": " Assume you are a teacher."
    },
    {
      "timestamp": [
        1086.34,
        1111.1399999999999
      ],
      "text": " You have completed your class on exit ticket and you would like to, and you have collected"
    },
    {
      "timestamp": [
        1111.14,
        1124.5800000000002
      ],
      "text": " your student feedback on a Google Form exit ticket, Google Forms exit ticket."
    },
    {
      "timestamp": [
        1124.58,
        1148.1599999999999
      ],
      "text": " Now check the attached response sheet to answer the questions that I ask you."
    },
    {
      "timestamp": [
        1148.38,
        1172.1000000000001
      ],
      "text": " I want to understand my students' perspective before I handle the next session."
    },
    {
      "timestamp": [
        1172.1000000000001,
        1174.88
      ],
      "text": " Now I'm going to ask questions to chat GPT."
    },
    {
      "timestamp": [
        1174.88,
        1181.64
      ],
      "text": " I will attach this file, exit ticket responses."
    },
    {
      "timestamp": [
        1181.64,
        1184.0400000000002
      ],
      "text": " Open."
    },
    {
      "timestamp": [
        1184.0400000000002,
        1187.5600000000002
      ],
      "text": " To attach the file, I clicked on the plus icon."
    },
    {
      "timestamp": [
        1187.5600000000002,
        1191.0800000000002
      ],
      "text": " After I click on the plus icon, I selected the file."
    },
    {
      "timestamp": [
        1191.0800000000002,
        1195.0800000000002
      ],
      "text": " After selecting the file and click open, it gets attached."
    },
    {
      "timestamp": [
        1195.0800000000002,
        1199.68
      ],
      "text": " Now you need to click this arrow."
    },
    {
      "timestamp": [
        1199.68,
        1206.64
      ],
      "text": " Now chat GPT says, I'll analyze the exit ticket responses and summarize key insights."
    },
    {
      "timestamp": [
        1206.64,
        1210.88
      ],
      "text": " Let me process the file and extract useful information."
    },
    {
      "timestamp": [
        1210.88,
        1216.48
      ],
      "text": " File contains a sheet named, so it is now trying to rephrase what all it has done."
    },
    {
      "timestamp": [
        1216.48,
        1220.64
      ],
      "text": " I've extracted the key columns from the exit ticket responses."
    },
    {
      "timestamp": [
        1220.64,
        1225.76
      ],
      "text": " Students mentioned learning about new uses and it tries to summarize whatever it has"
    },
    {
      "timestamp": [
        1225.76,
        1227.52
      ],
      "text": " seen there."
    },
    {
      "timestamp": [
        1227.52,
        1233.76
      ],
      "text": " As for the lesson, most of the students felt prepared with responses like yes, yes, definitely."
    },
    {
      "timestamp": [
        1233.76,
        1236.08
      ],
      "text": " While one mentioned no."
    },
    {
      "timestamp": [
        1236.08,
        1237.48
      ],
      "text": " Suggestions for improvement."
    },
    {
      "timestamp": [
        1237.48,
        1238.72
      ],
      "text": " Students engaged."
    },
    {
      "timestamp": [
        1238.72,
        1244.32
      ],
      "text": " Suggested hands-on sessions using Colab and providing more clarity in explanations."
    },
    {
      "timestamp": [
        1244.32,
        1247.2
      ],
      "text": " So these are some of the summarized views."
    },
    {
      "timestamp": [
        1247.2,
        1251.44
      ],
      "text": " Now I can again ask chat GPT more questions on this."
    },
    {
      "timestamp": [
        1251.44,
        1255.0
      ],
      "text": " How do I ask more questions on this?"
    },
    {
      "timestamp": [
        1255.0,
        1258.12
      ],
      "text": " Let's see."
    },
    {
      "timestamp": [
        1258.12,
        1280.04
      ],
      "text": " I would like to know what percentage of students are happy with my class."
    },
    {
      "timestamp": [
        1280.04,
        1282.12
      ],
      "text": " This is the next question."
    },
    {
      "timestamp": [
        1282.12,
        1287.2399999999998
      ],
      "text": " 69.2% of the students felt prepared and happy with your class."
    },
    {
      "timestamp": [
        1287.2399999999998,
        1290.9199999999998
      ],
      "text": " Let me know if you need a deeper analysis."
    },
    {
      "timestamp": [
        1290.9199999999998,
        1293.32
      ],
      "text": " Yes."
    },
    {
      "timestamp": [
        1293.32,
        1308.52
      ],
      "text": " I would like to know if my class was engaging enough for my students."
    },
    {
      "timestamp": [
        1308.52,
        1315.04
      ],
      "text": " Very interesting."
    },
    {
      "timestamp": [
        1315.04,
        1318.52
      ],
      "text": " I can ask any question to chat GPT now."
    },
    {
      "timestamp": [
        1318.52,
        1327.44
      ],
      "text": " The 97.4% of students mentioned a key takeaway from the class."
    },
    {
      "timestamp": [
        1327.44,
        1329.36
      ],
      "text": " Indicating high engagement."
    },
    {
      "timestamp": [
        1329.36,
        1336.32
      ],
      "text": " This suggests that most students found the session meaningful and actively participated."
    },
    {
      "timestamp": [
        1336.32,
        1341.6399999999999
      ],
      "text": " Like say yes chat GPT is ready to take more questions from you."
    },
    {
      "timestamp": [
        1341.6399999999999,
        1347.44
      ],
      "text": " Now that you see that your students have understood the class, you can actually you are well prepared"
    },
    {
      "timestamp": [
        1347.44,
        1349.72
      ],
      "text": " to take up the next session."
    },
    {
      "timestamp": [
        1349.72,
        1351.6000000000001
      ],
      "text": " Hope you enjoyed the session."
    },
    {
      "timestamp": [
        1351.6000000000001,
        1352.6000000000001
      ],
      "text": " Thank you all."
    },
    {
      "timestamp": [
        1352.6000000000001,
        1353.6000000000001
      ],
      "text": " See you in the next session."
    }
  ]
}


const fakeApiCall = () => new Promise((res) => setTimeout(res, 1200));

// YouTube URL validation function
const isValidYouTubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})(\S*)?$/;
  return youtubeRegex.test(url);
};

// Add TranscriptEditor as a local component at the top level of this file
interface TranscriptEditorProps {
  transcriptText: string;
  segmentSeconds: number[];
  setTranscriptText: React.Dispatch<React.SetStateAction<string>>;
  setSegmentSeconds: React.Dispatch<React.SetStateAction<number[]>>;
}

const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
  transcriptText,
  segmentSeconds,
  setTranscriptText,
  setSegmentSeconds,
}) => {
  const [editingWord, setEditingWord] = React.useState<{ segIdx: number; wordIdx: number } | null>(null);
  const [editValue, setEditValue] = React.useState('');

  // Helper: split transcript into segments based on segmentSeconds
  const getSegmentsFromTranscript = (text: string, endpoints: number[]): { start: number; end: number; text: string; wordStart: number; wordEnd: number }[] => {
    const words = text.split(' ');
    const totalDuration = endpoints[endpoints.length - 1] || 1;
    return endpoints.map((end, i) => {
      const start = i === 0 ? 0 : endpoints[i - 1];
      const wordStart = Math.floor((start / totalDuration) * words.length);
      const wordEnd = Math.floor((end / totalDuration) * words.length);
      return {
        start,
        end,
        text: words.slice(wordStart, wordEnd).join(' '),
        wordStart,
        wordEnd,
      };
    });
  };

  const handleWordDoubleClick = (segIdx: number, wordIdx: number, word: string) => {
    setEditingWord({ segIdx, wordIdx });
    setEditValue(word);
  };
  const handleWordEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };
  const handleWordEditSave = (segIdx: number, wordIdx: number) => {
    const segments = getSegmentsFromTranscript(transcriptText, segmentSeconds);
    const allWords = transcriptText.split(' ');
    const seg = segments[segIdx];
    const globalWordIdx = seg.wordStart + wordIdx;
    allWords[globalWordIdx] = editValue;
    setTranscriptText(allWords.join(' '));
    setEditingWord(null);
    setEditValue('');
  };
  const handleWordEditCancel = () => {
    setEditingWord(null);
    setEditValue('');
  };

  // Segment drag logic
  const handleSegmentDrag = (idx: number, newValue: number) => {
    const min = idx === 0 ? 1 : segmentSeconds[idx - 1] + 1;
    const max = idx === segmentSeconds.length - 1 ? newValue : segmentSeconds[idx + 1] - 1;
    const clamped = Math.max(min, Math.min(newValue, max));
    setSegmentSeconds((prev: number[]) => prev.map((v: number, i: number) => (i === idx ? clamped : v)));
  };
  const handleAddSegmentBetween = (idx: number) => {
    const prev = segmentSeconds[idx];
    const next = segmentSeconds[idx + 1] ?? prev + 10;
    const newVal = prev + (next - prev) / 2;
    setSegmentSeconds((prevArr: number[]) => {
      const arr = [...prevArr];
      arr.splice(idx + 1, 0, newVal);
      return arr;
    });
  };
  const handleRemoveSegment = (idx: number) => {
    if (segmentSeconds.length <= 1) return;
    setSegmentSeconds((prevArr: number[]) => prevArr.filter((_: number, i: number) => i !== idx));
  };

  return (
    <div className="mb-8 p-6 bg-muted rounded-xl border shadow">
      <h3 className="text-lg font-semibold mb-2 text-foreground">Transcript Editor</h3>
      <div className="mb-4 p-3 bg-muted-foreground/10 rounded">
        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
          <li>Each <span className="font-semibold text-primary">segment</span> is a part of your transcript, defined by a time range.</li>
          <li>To <span className="font-semibold text-primary">edit a word</span>, double-click it. Press <kbd>Enter</kbd> or click away to save, <kbd>Esc</kbd> to cancel.</li>
          <li>To <span className="font-semibold text-primary">add</span> or <span className="font-semibold text-primary">remove</span> a segment, use the <Plus className="inline w-4 h-4" /> or <Minus className="inline w-4 h-4" /> buttons.</li>
          <li>To <span className="font-semibold text-primary">adjust segment boundaries</span>, drag the slider below each segment.</li>
        </ol>
        <div className="mt-2 text-xs text-muted-foreground">Tip: Segments help organize your transcript for question generation and video navigation.</div>
      </div>
      <div className="space-y-6">
        {getSegmentsFromTranscript(transcriptText, segmentSeconds).map((seg, segIdx, arr) => (
          <React.Fragment key={segIdx}>
            <div
              className={
                `relative mb-4 p-4 border rounded-lg flex flex-col gap-2 transition-colors duration-150 ${
                  editingWord && editingWord.segIdx === segIdx ? 'bg-primary/10 border-primary' : 'bg-muted-foreground/10 border-muted'
                } hover:bg-primary/5 focus-within:bg-primary/10`
              }
            >
              {segmentSeconds.length > 1 && (
                <button
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors text-lg font-bold z-10"
                  onClick={() => handleRemoveSegment(segIdx)}
                  title="Remove this segment"
                  aria-label="Remove segment"
                >
                  <Minus className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center mb-2 gap-2">
                <span className="font-semibold text-primary mr-2">Segment {segIdx + 1}:</span>
                <span className="text-xs text-muted-foreground">{seg.start.toFixed(2)}s - {seg.end.toFixed(2)}s</span>
              </div>
              {segIdx < segmentSeconds.length - 1 && (
                <div className="flex flex-col gap-1 mt-2">
                  <label className="text-xs text-muted-foreground mb-1" htmlFor={`slider-${segIdx}`}>Drag to adjust where this segment ends:</label>
                  <div className="flex items-center gap-3 bg-muted px-3 py-2 rounded">
                    <input
                      id={`slider-${segIdx}`}
                      type="range"
                      min={seg.start + 1}
                      max={segmentSeconds[segIdx + 1] - 1}
                      step="0.01"
                      value={segmentSeconds[segIdx]}
                      onChange={e => handleSegmentDrag(segIdx, parseFloat(e.target.value))}
                      className="w-64 accent-primary"
                      aria-label="Adjust segment end time"
                    />
                    <span className="text-xs text-muted-foreground">End: {segmentSeconds[segIdx].toFixed(2)}s</span>
                  </div>
                </div>
              )}
              <div className="p-3 bg-background rounded-lg shadow-sm min-h-[44px] text-base text-justify leading-relaxed break-words">
                {seg.text.split(' ').map((word, wordIdx) => (
                  editingWord && editingWord.segIdx === segIdx && editingWord.wordIdx === wordIdx ? (
                    <span key={wordIdx} className="inline-block bg-primary/20 rounded px-1 mr-1 mb-0.5 align-middle whitespace-nowrap">
                      <input
                        className="bg-transparent text-sm focus:outline-none focus:border-b-2 focus:border-primary border-0 p-0 m-0 align-middle min-w-[1ch] w-auto max-w-[8ch] user-select-text"
                        value={editValue}
                        onChange={handleWordEditChange}
                        onBlur={() => handleWordEditSave(segIdx, wordIdx)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleWordEditSave(segIdx, wordIdx);
                          if (e.key === 'Escape') handleWordEditCancel();
                        }}
                        autoFocus
                        aria-label="Edit word"
                        style={{ width: `${editValue.length + 2}ch` }}
                      />
                    </span>
                  ) : (
                    <span
                      key={wordIdx}
                      className="cursor-pointer hover:bg-primary/20 focus:bg-primary/20 rounded px-1 transition-colors duration-100 text-foreground mr-1 mb-0.5 align-middle whitespace-nowrap break-keep user-select-none"
                      onDoubleClick={e => { e.preventDefault(); e.stopPropagation(); handleWordDoubleClick(segIdx, wordIdx, word); }}
                      onMouseDown={e => e.preventDefault()}
                      title="Double-click to edit this word"
                      tabIndex={0}
                      aria-label={`Edit word: ${word}`}
                    >
                      {word}
                    </span>
                  )
                ))}
              </div>
            </div>
            {segIdx < arr.length - 1 && (
              <div className="flex justify-center my-4">
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/80 transition-colors text-2xl font-bold border-2 border-white"
                  onClick={() => handleAddSegmentBetween(segIdx)}
                  title="Add segment after"
                  aria-label="Add segment after"
                >
                  +
                </button>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default function AISectionPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [aiJobId, setAiJobId] = useState<string | null>(null);
  const [taskRuns, setTaskRuns] = useState<TaskRuns>({
    transcription: [],
    segmentation: [],
    question: [],
    upload: [],
  });
  const [acceptedRuns, setAcceptedRuns] = useState<{
    transcription?: string;
    segmentation?: string;
    question?: string;
    upload?: string;
  }>({});
  const [segParams, setSegParams] = useState({ segments: 5 });
  const [urlError, setUrlError] = useState<string | null>(null);
  const [showQuizQuestions, setShowQuizQuestions] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<{ segmentId: string; questionId: string } | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<Partial<Question>>({});
  const [videoDataState, setVideoDataState] = useState<VideoData>(sampleVideoData);

  
    // Use fetched data or fallback to sample data
    // const currentVideoData: VideoData = sampleVideoData;

    // Initialize videoDataState on mount or when currentVideoData changes
    // React.useEffect(() => {
    //   setVideoDataState(currentVideoData);
    // }, [currentVideoData]);

    const getDifficultyColor = (difficulty: Question['difficulty']): string => {
      switch (difficulty) {
        case 'easy': return 'text-green-600 bg-green-100';
        case 'medium': return 'text-yellow-600 bg-yellow-100';
        case 'hard': return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

     // Helper to start editing
  const handleEditClick = (segmentId: string, question: Question) => {
    setEditingQuestion({ segmentId, questionId: question.id });
    setEditedQuestion({ ...question });
  };

  // Helper to save edits
  const handleSaveEdit = (segmentId: string, questionId: string) => {
    setVideoDataState(prev => {
      if (!prev) return prev;
      const newSegments = prev.segments.map(segment => {
        if (segment.id !== segmentId) return segment;
        return {
          ...segment,
          questions: segment.questions.map(q =>
            q.id === questionId ? { ...q, ...editedQuestion } as Question : q
          ),
        };
      });
      return { ...prev, segments: newSegments } as VideoData;
    });
    setEditingQuestion(null);
    setEditedQuestion({});
  };

  // Helper to cancel editing
  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setEditedQuestion({});
  };


  const handleCreateJob = async () => {
    // Validate YouTube URL
    if (!youtubeUrl.trim()) {
      setUrlError("YouTube URL is required");
      return;
    }

    if (!isValidYouTubeUrl(youtubeUrl.trim())) {
      setUrlError("Please enter a valid YouTube URL");
      return;
    }

    setUrlError(null);
    // Simulate job creation
    setAiJobId("ai-job-" + Math.floor(Math.random() * 10000));
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    if (urlError) {
      setUrlError(null);
    }
  };

  const resetPage = () => {
    setYoutubeUrl("");
    setAiJobId(null);
    setTaskRuns({
      transcription: [],
      segmentation: [],
      question: [],
      upload: [],
    });
    setAcceptedRuns({});
    setSegParams({ segments: 5 });
    setUrlError(null);
  };

  const handleTask = async (task: keyof TaskRuns) => {
    const runId = `run-${Date.now()}-${Math.random()}`;
    const newRun: TaskRun = {
      id: runId,
      timestamp: new Date(),
      status: "loading",
      parameters: task === "segmentation" ? { ...segParams } : undefined,
    };

    setTaskRuns(prev => ({
      ...prev,
      [task]: [...prev[task], newRun],
    }));

    try {
      await fakeApiCall();
      setTaskRuns(prev => ({
        ...prev,
        [task]: prev[task].map(run =>
          run.id === runId
            ? { ...run, status: "done", result: `Sample result for ${task} run ${prev[task].length}` }
            : run
        ),
      }));
      if (task === "upload") {
        toast.success("Section successfully added to course!");
        setTimeout(() => {
          resetPage();
        }, 1500);
      }
    } catch {
      setTaskRuns(prev => ({
        ...prev,
        [task]: prev[task].map(run =>
          run.id === runId
            ? { ...run, status: "failed" }
            : run
        ),
      }));
    }
  };

  const handleAcceptRun = (task: keyof TaskRuns, runId: string) => {
    setAcceptedRuns(prev => ({ ...prev, [task]: runId }));
    toast.success(`${task} run accepted!`);
  };

  const handleSegParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSegParams({ ...segParams, segments: Number(e.target.value) });
  };

  const canRunTask = (task: keyof TaskRuns): boolean => {
    switch (task) {
      case "transcription":
        return !!aiJobId;
      case "segmentation":
        return !!acceptedRuns.transcription;
      case "question":
        return !!acceptedRuns.segmentation;
      case "upload":
        return !!acceptedRuns.question;
      default:
        return false;
    }
  };

  const TaskAccordion = ({ task, title }: { task: keyof TaskRuns; title: string }) => {
    const runs = taskRuns[task];
    const acceptedRunId = acceptedRuns[task];
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleTask(task)}
            disabled={!canRunTask(task) || runs.some(r => r.status === "loading")}
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-2" />
            {title}
          </Button>
          {task === "segmentation" && (
            <>
              <span>Segments:</span>
              <Input
                type="number"
                min={1}
                max={20}
                value={segParams.segments}
                onChange={handleSegParamChange}
                className="w-16"
                disabled={runs.some(r => r.status === "loading")}
              />
            </>
          )}
        </div>
        {runs.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            {runs.map((run, index) => (
              <AccordionItem key={run.id} value={run.id}>
                <AccordionTrigger className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {task === 'upload' ? (
                      <>
                        {run.status === 'loading' && <><span>Creating course...</span> <Loader2 className="animate-spin w-4 h-4" /></>}
                        {run.status === 'done' && <><span>Done</span> <CheckCircle className="text-green-500 w-4 h-4" /></>}
                        {run.status === 'failed' && <span className="text-red-500">Failed</span>}
                      </>
                    ) : (
                      <>
                        <span>Run {index + 1}</span>
                        {run.status === "loading" && <Loader2 className="animate-spin w-4 h-4" />}
                        {run.status === "done" && <CheckCircle className="text-green-500 w-4 h-4" />}
                        {run.status === "failed" && <span className="text-red-500">Failed</span>}
                        {acceptedRunId === run.id && <Check className="text-blue-500 w-4 h-4" />}
                      </>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {run.timestamp.toLocaleTimeString()}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {run.parameters && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Parameters:</strong> {JSON.stringify(run.parameters)}
                      </div>
                    )}
                    {run.status === "done" && task !== 'upload' && (
                      <div className="space-y-2">
                        <div className="text-sm">
                          <strong>Result:</strong> {run.result}
                        </div>
                        {acceptedRunId !== run.id && (
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRun(task, run.id)}
                            className="w-full"
                          >
                            Accept This Run
                          </Button>
                        )}
                      </div>
                    )}
                    {run.status === "failed" && (
                      <div className="text-sm text-red-500">
                        This run failed. Try running the task again.
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    );
  };

  // Add state for showTranscriptSection
  const [showTranscriptSection, setShowTranscriptSection] = useState(false);

  // Example transcript and segment endpoints (replace with backend data as needed)
  const [transcriptText, setTranscriptText] = useState<string>(
    sampleTranscript.text);
  const [segmentSeconds, setSegmentSeconds] = useState<number[]>([47.09, 120.34, 230.67, 500.56]);

  return (
    <div className="max-w-4xl w-full mx-auto py-10 px-4">
      <div className="bg-muted/30 rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-8 text-center">Generate Section using AI</h1>
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row gap-6 items-center w-full mt-4">
            <div className="flex-1 w-full">
              <Input
                placeholder="YouTube URL"
                value={youtubeUrl}
                onChange={handleUrlChange}
                disabled={!!aiJobId}
                className={`flex-1 w-full ${urlError ? 'border-red-500' : ''}`}
              />
              {urlError && (
                <p className="text-red-500 text-sm mt-1">{urlError}</p>
              )}
            </div>
            <Button
              onClick={handleCreateJob}
              disabled={!youtubeUrl || !!aiJobId}
              className="w-full sm:w-auto mt-2 sm:mt-0"
            >
              {aiJobId ? "Job Created" : "Create AI Job"}
            </Button>
          </div>
          {aiJobId && (
            <div className="space-y-6">
              <TaskAccordion task="transcription" title="Transcription" />
              <TaskAccordion task="segmentation" title="Segmentation" />
              <TaskAccordion task="question" title="Question Generation" />
              <TaskAccordion task="upload" title="Upload to Course" />
            </div>
          )}
        </div>
      </div>
      {/* Button to show/hide Quiz Questions Section */}
        <button
        className="bg-primary text-primary-foreground px-4 py-2 rounded mb-4 mt-8"
          onClick={() => setShowQuizQuestions((prev) => !prev)}
        >
          {showQuizQuestions ? "Hide Quiz Questions" : "Show Quiz Questions"}
        </button>
      {showQuizQuestions && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Quiz Questions</h3>
          <div className="space-y-6">
            {videoDataState?.segments.map((segment) => (
              <div key={segment.id}>
                <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 border p-3 sm:p-4 rounded-lg bg-muted">{`Questions for Segment ${(segment.startTime / 60)} min - ${(segment.endTime / 60)} min`}</h4>
                <div className="space-y-4 sm:space-y-6">
                  {segment.questions.map((question: Question, index: number) => {
                    const isEditing = editingQuestion && editingQuestion.segmentId === segment.id && editingQuestion.questionId === question.id;
                    return (
                      <div key={question.id} className="rounded-lg p-4 sm:p-6 bg-background border">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-2 sm:mb-3">
                              <span className="text-xs sm:text-sm font-medium px-2 py-0.5 rounded bg-muted-foreground/10 text-foreground">
                                Question {index + 1}
                              </span>
                              <span className={`text-xs sm:text-sm font-medium px-2 py-0.5 rounded ${getDifficultyColor(question.difficulty)}`}>{question.difficulty}</span>
                              <span className="text-xs sm:text-sm px-2 py-0.5 rounded bg-muted-foreground/10 text-muted-foreground">
                                {question.topic}
                              </span>
                            </div>
                            {isEditing ? (
                              <div className="space-y-2">
                                <input
                                  className="w-full border rounded p-2 mb-2"
                                  value={editedQuestion.question || ''}
                                  onChange={e => setEditedQuestion(q => ({ ...q, question: e.target.value }))}
                                />
                                <div className="space-y-1">
                                  {editedQuestion.options?.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex items-center gap-2">
                                      <input
                                        className="flex-1 border rounded p-1"
                                        value={opt}
                                        onChange={e => {
                                          const newOptions = [...(editedQuestion.options || [])];
                                          newOptions[optIdx] = e.target.value;
                                          setEditedQuestion(q => ({ ...q, options: newOptions }));
                                        }}
                                      />
                                      <input
                                        type="radio"
                                        name={`correct-${question.id}`}
                                        checked={editedQuestion.correctAnswer === optIdx}
                                        onChange={() => setEditedQuestion(q => ({ ...q, correctAnswer: optIdx }))}
                                      />
                                      <span className="text-xs">Correct</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <button
                                    className="bg-green-600 text-white px-3 py-1 rounded"
                                    onClick={() => handleSaveEdit(segment.id, question.id)}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="bg-gray-400 text-white px-3 py-1 rounded"
                                    onClick={handleCancelEdit}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex justify-between items-start mb-3 sm:mb-4">
                                  <h4 className="text-base sm:text-lg font-medium mb-0">{question.question}</h4>
                                  <button
                                    className="ml-2 px-3 py-1 min-w-48 rounded-full text-primary font-semibold hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary flex items-center text-xs sm:text-sm"
                                    onClick={() => handleEditClick(segment.id, question)}
                                    title="Edit Question"
                                  >
                                    Edit
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        {!isEditing && (
                          <div className="space-y-2">
                            {question.options.map((option: string, optionIndex: number) => (
                              <div
                                key={optionIndex}
                                className={`p-2 sm:p-3 rounded-lg border ${optionIndex === question.correctAnswer
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background border-muted text-foreground'
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${optionIndex === question.correctAnswer
                                      ? ' text-primary-foreground'
                                      : 'bg-muted text-muted-foreground'
                                  }`}>
                                    {String.fromCharCode(65 + optionIndex)}
                                  </span>
                                  <span className="text-sm sm:text-base whitespace-nowrap">{option}</span>
                                  {optionIndex === question.correctAnswer && (
                                    <CheckCircle className="h-4 w-4 text-green-600 ml-auto flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Button to show/hide Transcript Section */}
      <div className="flex gap-4 mb-4 mt-8">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setShowTranscriptSection(prev => !prev)}
        >
          {showTranscriptSection ? "Hide Transcript" : "Show Transcript"}
        </button>
      </div>
      {showTranscriptSection && (
        <TranscriptEditor
          transcriptText={transcriptText}
          segmentSeconds={segmentSeconds}
          setTranscriptText={setTranscriptText}
          setSegmentSeconds={setSegmentSeconds}
        />
      )}
    </div>
  );
} 