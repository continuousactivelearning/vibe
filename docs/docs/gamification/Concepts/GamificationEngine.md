# Gamification Engine

## Overview

The Gamification Engine is a dedicated service that updates user metrics and evaluates achievements only at the metric level. It is not aware of events or rules. These are handled in the Gamification Layer, which processes incoming user actions and determines when and how to trigger metric updates.

---

## What it does?:

**This component is responsible for:**

- Incrementing user metrics

- Checking for and unlocking achievements when a metric is updated

- Handling metrics and achievement at admin & user scope.

_Note: Gamification Engine has no knowledge of rules and events._

## 🧠 Core Concepts

### 🎯 Metrics

Gamification metrics are measurable elements that form the foundation of the application's gamification system, helping to quantify and drive user engagement.

#### What they do?

- Unit of progress tracking (e.g., correct answers, fast completions, points earned)

- Defined by Admins

- Is lazy initialized to every user.

- Can be triggered directly with metric trigger.

### 🏅 Achievements

Achievements are game elements that are awarded upon reaching a certain threshold defined over a metric (e.g., badges).

#### What they do?

- Defined by associating them with a metric and a threshold (e.g., Points master badge is unlocked when 500 points are earned.)

- Unlocked by Gamification Engine during metric trigger.

### 🔄 Metric Trigger

After creating your metrics and achievements, you can use the `metric-trigger` API to update several metrics at once for a user. When you do this, the system will automatically check if the user has unlocked any new achievements based on these updates and adds it to the respective users, making it easy to track progress and award rewards in real time.
