## Challenge
1.  Add a  `POST /transfer`  endpoint allowing customers to transfer points to another account.
    
2.  Validate:
    
    -   Both  `fromCustomerId`  and  `toCustomerId`  must be valid UUIDs.
        
    -   `points`  must be a positive integer.
        
    -   The sender must have enough points.
        
3.  Return appropriate errors for each failure case.
    

## Solution 


  ```typescript
// Schema
const TransferSchema = z.object({
  fromCustomerId: z.string().uuid(),
  toCustomerId: z.string().uuid(),
  points: z.number().int().positive(),
});

// Route
router.post(
  "/transfer",
  validate(TransferSchema),
  async (req: Request<{}, {}, z.infer<typeof TransferSchema>>, res) => {
    const { fromCustomerId, toCustomerId, points } = req.body;

    // Check sender
    const fromMember = await db.loyaltyMembers.findOne({ customerId: fromCustomerId });
    if (!fromMember) {
      throw new ApiError(404, "Sender not found");
    }

    // Check receiver
    const toMember = await db.loyaltyMembers.findOne({ customerId: toCustomerId });
    if (!toMember) {
      throw new ApiError(404, "Receiver not found");
    }

    // Check points
    if (fromMember.points < points) {
      throw new InsufficientPointsError();
    }

    // Transfer points
    await db.loyaltyMembers.updateOne(
      { customerId: fromCustomerId },
      { $inc: { points: -points } }
    );
    await db.loyaltyMembers.updateOne(
      { customerId: toCustomerId },
      { $inc: { points: points } }
    );

    res.json({
      status: "success",
      data: {
        fromCustomerId,
        toCustomerId,
        transferredPoints: points,
        remainingPoints: fromMember.points - points,
      },
    });
  }
);


  ```



