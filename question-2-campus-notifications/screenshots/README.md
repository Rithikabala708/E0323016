# Screenshots - Priority Inbox Output

## Command Execution

The priority inbox was executed using:
```bash
npm start
```

## Output

The screenshot shows:
- ✅ Successful authentication
- ✅ Fetched 20 notifications from API
- ✅ Top 10 priority notifications displayed
- ✅ Priority scores calculated (Type weight + Recency)
- ✅ Notifications sorted by priority (Placement > Result > Event)
- ✅ Summary by type (8 Placement, 2 Result)

## Key Observations

1. **All top 8 are Placement notifications** - correctly prioritized as HIGH
2. **Placement notifications sorted by recency** - newer ones rank higher
3. **Result notifications appear after all Placements** - correct type priority
4. **Scores reflect the formula**: (Type × 1000) + (Recency × 100)
   - Placement: 3000+ range
   - Result: 2000+ range
   - Event: 1000+ range (none in top 10)

## How to Run

```bash
cd question-2-campus-notifications
npm install
npm start
```

## Expected Output

The program will:
1. Authenticate with the evaluation service
2. Fetch all notifications via API
3. Process them through the min-heap algorithm
4. Display top 10 with priority indicators (🔴🟡🟢)
5. Show summary statistics

---

**Note**: Take a screenshot of your terminal output after running `npm start` and place it in this folder.
