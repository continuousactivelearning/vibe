---
title: "Getting Started: XP Tracker"
sidebar_position: 1
---

### Example: XP Tracker – Awarding Experience & Unlocking Badges

Let’s walk through a basic gamification scenario.

We want to award **XP (experience points)** to users as they complete specific activities—such as finishing quizzes or lessons. When a user reaches 1000 XP, they will automatically unlock the **Master Badge** as a reward for their progress.

This example will **demonstrate** how to:

- Define a **metric**.
- Define an **achievement**.
- Use **metric-trigger API** to unlock achievements.

## 📦 Step 1: Define a Metric

[**Metrics**](../Concepts/GamificationEngine#-metrics) represent quantifiable measures of user activity—such as experience points (XP), time spent, tasks completed, or points earned. They serve as the foundation for tracking progress and triggering rewards.

In this example, we’ll define a metric called xp, which will be used to track the amount of experience a user has accumulated over time.

You can use the `api/gamification/engine/metrics` endpoint to create metrics.

### Endpoint

```curl
POST /api/gamification/engine/metrics
```

### Example Payload

```json
{
  "name": "XP",
  "description": "XP earned by the user for completing tasks",
  "type": "Number",
  "units": "points",
  "defaultIncrementValue": 10 // used by triggers
}
```

> This Endpoint returns the payload along with metricID.

## 🏅 Step 2: Create an Achievement

[**Achievements**](../Concepts/GamificationEngine#-achievements) are special rewards unlocked when a user reaches a specific milestone tied to a metric.

In this example, we'll define the **Master Badge** achievement, which is awarded when a user's xp metric reaches 1000 XP. This allows users to feel a sense of progression and accomplishment as they engage with your platform.

### Endpoint

```curl
POST api/gamification/engine/achievements
```

### Example Payload

```json
{
  "name": "Master Badge",
  "trigger": "metric",
  "metric": "<metricId>", // Replace with the actual Metric ID for XP
  "metricTotal": 1000,
  "badgeUrl": "masterbadge.png" // Custom Image of the badge.
}
```

## 👤 Step 3: Initialize User Achievements (Eager init)

To ensure a smooth experience, it's recommended to eagerly initialize a user's achievement records when they first sign up.

This means that as soon as a new user is created, their achievement progress should be set up—ready to track milestones from the very beginning.

### Endpoint

```curl
POST /api/gamification/engine/user/achievements

```

### Example Payload

```json
{
  "userId": "60d5ec49b3f1c8e4a8f8b8c1",
  "achievements": []
}
```

### Why?

- This ensures the engine can track achievement unlocks per user, even before any metrics are updated.

- Eager initialization avoids delays or missing progress that could occur if achievements were initialized later.

## 🧮 Step 4: Access User Metrics (Lazy init)

User metrics are **lazy-initialized**, meaning they’re automatically created the first time a user interacts with them.

This ensures that all users always have the necessary metric records—without requiring upfront setup. It keeps your system consistent, fault-tolerant, and easy to maintain.
If needed, you can also choose to manually initialize metrics using `/api/gamification/engine/user/metrics/` API endpoint in advance for more control.

You can use either of the below two endpoints:

```curl
GET api/gamification/engine/usermetrics/{userId}
```

> _You can think of this action as happening automatically whenever you fetch a user's metric data—such as when displaying their progress on a dashboard._

## ⚙️ Step 5: Trigger a Metric Update

Now you're ready to **trigger the XP metric** whenever users complete meaningful actions—like finishing lessons, taking quizzes, or any other interaction you choose to reward.

In this example, we’ll use the `metric-trigger` API to update the `xp` metric each time a qualifying action occurs. This is entirely customizable—you decide when and how metrics should be updated.

You can specify how much to increment a metric using the `value` field in the API call. Alternatively, you can let the system handle it using the `defaultIncrementValue` defined when the metric was created.

If the conditions for an achievement are met (for example, reaching **1000 XP**), the system will automatically unlock the corresponding reward for the user.

### Endpoint

```curl
POST /api/gamification/engine/metrictrigger
```

### Example Payload

```json
{
  "userId": "<userId>",
  "metrics": [
    {
      "metricId": "<xpMetricId>",
      "value": 50 // if not given default increment value of metric is used.
    }
  ]
}
```

## 🪟 Step 6: Fetch unlocked rewards

You can view the unlocked rewards for a user using `/api/gamification/engine/user/{userId}/achievements/` API endpoint.

## 🎉 Wrapping Up

With this setup, you now have a **fully functional XP tracking and achievement system** in place. You've defined a metric, configured an achievement, and learned how to trigger updates based on user interactions—all while keeping the system flexible and scalable.

This foundational flow can be extended to support more complex gamification scenarios, such as custom event-based rewards. From here, feel free to build on this example to match the unique needs of your application and engage your users even further.
