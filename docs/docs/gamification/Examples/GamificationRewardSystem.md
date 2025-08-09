---
title: "Reward-Linked Achievements"
sidebar_position: 4
---

## Example: Rewarding Diamonds Based on XP

In this example, we'll demonstrate how to implement a gamification scenario where users are rewarded with 100 Diamonds upon reaching a threshold of 1,000 XP.

This approach enhances user engagement by linking meaningful rewards to clear, measurable progress milestones.

This example will **demonstrate** how to:

- Define [**Metrics**](../Concepts/GamificationEngine#-metrics) to reward other metrics.
- Use [**Metric-trigger**](../Concepts/GamificationEngine#-metric-triggers) to unlock such reward-linked achievements.

## 📦 Step 1: Define Metrics

### Metric 1: XP

This metric tracks the XP (experience points) earned by a user upon using the app.

#### Endpoint

```curl
POST /api/gamification/engine/metrics
```

#### Example Payload

```json
{
  "name": "XP",
  "description": "Tracks the total XP of a user.",
  "type": "Number",
  "units": "points",
  "defaultIncrementValue": 1
}
```

### Metric 2: Diamonds

This metric tracks the total number of Diamonds currently held by a user.

#### Endpoint

```curl
POST /api/gamification/engine/metrics
```

#### Example Payload

```json
{
  "name": "Diamonds",
  "description": "Diamonds earned.",
  "type": "Number",
  "units": "diamonds",
  "defaultIncrementValue": 1
}
```

## 🏆 Step 2: Define Achievement

Now that the required metrics are defined, we can proceed to configure the achievement, which we’ll call `XP-Hero`.

This achievement is triggered when a user reaches **1000 XP**, and rewards them with **100 Diamonds**.

To configure this:

- Use the `rewardMetricId` field to specify the metric representing the reward — in this case, Diamonds.

- Use the `rewardIncrementValue` field to define the amount to be awarded — here, 100.

These fields ensure that when the achievement conditions are met, the user is granted the appropriate reward automatically.

#### Endpoint

```curl
POST /api/gamification/engine/achievements
```

#### Example Payload

```json
{
  "name": "XP-Hero",
  "description": "Reward 100 Diamonds for reaching 1000 XP.",
  "trigger": "metric",
  "metricId": "<XPMetricID>",
  "metricCount": 1000,
  "rewardMetricId": "<DiamondsMetricID>",
  "rewardIncrementValue": 100
}
```

## ⚙️ Step 4: Trigger the Metric

Now you're ready to **trigger the XP metric** whenever users complete meaningful actions—like finishing lessons, taking quizzes, or any other interaction you choose to reward.

In this example, we’ll use the `metric-trigger` API to update the `xp` metric each time a qualifying action occurs. This is entirely customizable—you decide when and how metrics should be updated.

You can specify how much to increment a metric using the `value` field in the API call. Alternatively, you can let the system handle it using the `defaultIncrementValue` defined when the metric was created.

If the conditions for an achievement are met (for example, reaching **1000 XP**), the system will automatically unlock the corresponding reward for the user — here **100 Diamonds**.

#### Endpoint

```curl
POST /api/gamification/engine/metrictrigger
```

#### Example Payload

```json
{
  "userId": "<userId>",
  "metrics": [
    {
      "metricId": "<XPMetricID>",
      "value": 50 // if not given default increment value of metric is used.
    }
  ]
}
```

## 🪟 Step 5: Fetch Unlocked Rewards

You can view the unlocked rewards for a student using the `/api/gamification/engine/user/{userId}/achievements/` API endpoint.

Alternatively, you can also use `/api/gamification/engine/user/{userId}/metrics/` endpoint to fetch the updated metrics.

## 🎉 Wrapping Up

You’ve now seen how to define and use **reward-linked achievements** within a gamification framework. By setting up relevant metrics like **XP** and **Diamonds**, configuring achievements such as **XP-Hero**, and leveraging metric triggers, you can create engaging, milestone-driven rewards that motivate users to stay active and progress.

This example provides a foundational approach that can be extended to suit a wide range of gamification strategies—whether it’s rewarding badges, points, or other incentives based on user behavior.

Feel free to explore further customization options within the gamification engine to tailor rewards and triggers to your specific use cases.
