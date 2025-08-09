---
title: "Gamify a Quiz App"
sidebar_position: 2
---

### Example: QuizApp-Quick Solver Achievement

Consider a gamification scenario for a quiz application.

We want to reward users who demonstrate both speed and accuracy in assessments. For example, when a user **completes a quiz in 5 minutes or less and scores at least 80%**, they will unlock the **Quick Solver Badge** as a recognition of excpetional performance.

This example will **demonstrate** how to:

- Define **events** to track quiz completions and performance.
- Define **rules** for rewarding users who meet specific quiz-related milestones.
- Use **event-trigger** to evaluate conditions and unlock achievements.

## 📦 Step 1: Define a Metric

As a first step, we need to create a [**metric**](../Concepts/GamificationEngine#-metrics) to track the progress toward unlocking the **Quick Solver** achievement, Let's call it `quickSolverCounter`.

### Endpoint

```curl
POST /api/gamification/engine/metrics
```

### Example Payload

```json
{
  "name": "QuickSolverCounter",
  "description": "A counter to track QuickSolver Achievement.",
  "type": "Number",
  "units": "points",
  "defaultIncrementValue": 1
}
```

## 🏆 Step 2: Define an Achievement

Register an [**achievement**](../Concepts/GamificationEngine#-achievements) that unlocks when the **quickSolverCounter** metric reaches a value of 1.

```curl
POST api/gamification/engine/achievements
```

### Example Payload

```json
{
  "Name": "Quick Solver",
  "Trigger": "metric",
  "Metric": "<QuickSolverCounterID>",
  "MetricTotal": 1,
  "BadgeUrl": "QuickSolver.jpeg"
}
```

we set **MetricTotal to 1** because this achievement event is intended to be unlocked through a single qualifying completion, rather than through accumulated progress.

## 📅 Step 3: Register an Event

An [**event**](../Concepts/GamificationLayer#-events) represents a specific user action or activity within the system. For example, completing a quiz, logging in, or finishing a lesson can all be considered events. Events are used to capture and process data related to user interactions, which can then be evaluated to trigger metrics or unlock achievements.

In this context, the **QuizCompletion** event is triggered whenever a user completes a quiz. It includes details such as the user's score and the time taken to complete the quiz.

We need to create a **QuizCompletion** event. This event is triggered whenever a quiz is completed, and it also holds the payload structure that is expected during the event trigger
(i.e. `score`, `timetaken`).

### Endpoint

```curl
POST api/gamification/events
```

### Example Payload

```json
{
  "eventName": "QuizCompletion",
  "eventDescription": "Triggered when a user completed a quiz",
  "eventVersion": "1.0.0",
  "eventPayload": {
    "score": "Number",
    "timetaken": "Number"
  }
}
```

## 📜 Step 4: Define a Rule

A [**rules**](../Concepts/GamificationLayer#-rules) defines the conditions under which an event leads to a specific outcome, such as unlocking an achievement or updating a metric. Rules evaluate the data provided by events and determine whether the criteria for a reward or milestone have been met.

Let’s define a **rule** that evaluates incoming event data to determine whether the conditions for unlocking the **Quick Solver** badge are met.

The rule should be configured to trigger when:

- The user's **score** is **greater than or equal to 80**, and
- The **time taken** is **less than or equal to 300 seconds**.

This ensures the badge is awarded only for fast and high-performing quiz attempts.

### Endpoints

```curl
POST api/gamification/rules
```

### Example Payload

```json
{
  "ruleName": "QuickSolverRule",
  "ruleDescription": "Unlocks Quick Solver when conditions are met.",
  "eventId": "<QuizCompletionEventId>", // Replace with actual event ID
  "serializedLogic": {
    "and": [
      { "<=": [{ "var": "timeTaken" }, 300] },
      { ">=": [{ "var": "score" }, 80] }
    ]
  },
  "ruleVersion": 0,
  "metricId": "<QuickSolverCounterID>" // Replace with actual metric ID
}
```

Here the **QuickSolverRule** checks if the user's score is greater than or equal to 80 and the time taken is less than or equal to 300 seconds. If both conditions are satisfied, the rule triggers the Quick Solver Badge achievement.

### Using JSON Schema for Logic

We use [JSON Logic](https://jsonlogic.com) to define `serializedLogic` in rules as it's a simple yet powerful way to define and evaluate conditions in a structured and machine-readable format.
It allows developers to express complex logical operations, such as comparisons, boolean logic, and nested conditions, in a standardized way.

> Note:
> Before proceeding to triggering events, ensure that eager initialization of [**userAchievements**](./XP#-step-3-initialize-user-achievements-eager-init) and lazy initialization of [**userMetrics**](./XP#-step-4-access-user-metrics-lazy-init) has been performed.

## ⚙️ Step 5: Trigger an Event

Now you're ready to trigger the **QuizCompletion** event whenever a user completes a quiz. The event payload will include the user's score and the time taken to complete the quiz.

### Endpoint

```curl
POST /api/gamification/eventtrigger/
```

### Example Payload

```json
{
  "userId": "<userId>",
  "eventId": "<QuizCompletionEventId>",
  "eventPayload": {
    "score": 85,
    "timeTaken": 290
  }
}
```

## 🪟 Step 6: Fetch Unlocked Rewards

You can view the unlocked rewards for a user using the `/api/gamification/engine/user/{userId}/achievements/` API endpoint.

## 🎉 Wrapping Up

With this setup, you now have a **fully functional quiz gamification system** in place. You've defined a metric, configured an achievement, registered an event, and created a rule to evaluate conditions—all while keeping the system flexible and scalable.

This foundational flow can be extended to support more complex gamification scenarios, such as tracking multiple quiz-related achievements or introducing leaderboard features. From here, feel free to build on this example to match the unique needs of your application and engage your users even further.
