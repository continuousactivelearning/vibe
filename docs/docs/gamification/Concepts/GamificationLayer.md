# Gamification Layer

## Overview

The Gamification Layer is an abstraction layer on top of GamificationEngine which provides additional functions such as defining and managing **events** and **rules**.

Use the Gamification Layer when your gamification logic involves complex conditions or relies on external data sources that are not part of the gamification system.

---

## What it does?

**This component is responsible for:**

- Handling user-generated events (e.g., quiz completed, lesson passed)
- Evaluating logic rules using [JSON Logic](https://jsonlogic.com)
- Deciding whether to trigger metric updates
- Communicating with the **Gamification Engine** (which only handles metric updates and achievement evaluation)

_Note: The Gamification Layer handles all event and rule processing, while the Gamification Engine focuses solely on metrics and achievements._

---

## 🧠 Core Concepts

### 📅 Events

**Events** represent user actions such as **"completed quiz", "finished lesson", or "logged in"**, events are associated with one or more rules. Events also define the **structure of the data (external)** that the system can receive and act upon.

#### What they do?

- Represent user actions (e.g., completing a quiz, logging in).
- Holds the structure of the external data.
- Triggers multiple rules associated with it.

---

### 📜 Rules

Rules define the conditions under which achievements are unlocked. We are using [JSON Logic](https://jsonlogic.com) to express conditions.

#### What they do?

- Define conditional logic based on external data structures specified by an Event (e.g., “If a user completes 5 quizzes, increment the ‘Quiz Master’ metric”).

- These rules are evaluated within the Gamification Layer to determine whether a metric trigger should be executed, which inturn unlocks achievements.

---

### 🔄 Event Trigger

Once events and rules are registered, the system can begin processing real-time user data with **Event trigger**.

It is just a simple POST API that makes it easy to work with the entire system (evaluating rules, updating metrics, unlocking achievements).
