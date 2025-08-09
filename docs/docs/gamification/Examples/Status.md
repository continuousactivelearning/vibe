---
title: "Achievement Status Lifecycle"
sidebar_position: 3
---

# Achievement Status Lifecycle

An [**achievement**](../Concepts/GamificationEngine#-achievements) can exist in one of three states during its lifecycle: `ACTIVE`, `INACTIVE`, or `DELETED`. Understanding each state helps you manage how achievements behave within the system.

## Default Status

When you create a new **achievement**, its status is set to `ACTIVE` by default. This means:

- Users can immediately earn this achievement.
- Once a user meets the criteria, it’s automatically unlocked and added to their achievements list.
- No further action is required to make it available.

## Updating Status

You can update an achievement’s status based on whether it should be currently earnable:

### Statuses & Their Behavior

- **`ACTIVE` ✅**  
  The achievement is available and can be earned by users meeting the criteria.

- **`INACTIVE` ⏸️**  
  The achievement cannot be earned while in this state—even if users meet the criteria.

## Deleting Achievements

Achievements can be deleted in two ways: soft deletion (status change) or permanent deletion (final state).

### Soft Delete

Deleting an achievement via `/api/gamification/engine/achievements/{achievementId}` will soft-delete it by setting its status to `INACTIVE`. The achievement remains in the system and can be reactivated if needed.

### Hard Delete (Via Metric Deletion)

Deleting a metric will permanently remove all associated achievements by setting their status to `DELETED`. This is irreversible—`DELETED` achievements cannot be restored to `ACTIVE` or `INACTIVE` status.

> **Note:** Users who unlocked the achievement before deletion will still see it in their `userAchievements`.

## Summary Table

| Status     | Description                               | Can Be Earned? |   Reversible?   |
| ---------- | ----------------------------------------- | :------------: | :-------------: |
| `ACTIVE`   | Earnable achievement                      |      Yes       |       Yes       |
| `INACTIVE` | Temporarily not earnable (still exists)   |       No       | Yes (to ACTIVE) |
| `DELETED`  | Permanently removed (via metric deletion) |       No       |       No        |
