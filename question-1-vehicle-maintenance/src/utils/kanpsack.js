// Highly optimized 0/1 Knapsack with multiple optimizations
export function knapsack(tasks, capacity) {
    const n = tasks.length;
    
    // Edge cases
    if (n === 0 || capacity === 0) {
        return {
            maxImpact: 0,
            selectedTasks: []
        };
    }

    // Sort tasks by impact/duration ratio for better performance (greedy heuristic)
    const sortedTasks = tasks
        .map((task, idx) => ({ ...task, originalIndex: idx }))
        .sort((a, b) => (b.Impact / b.Duration) - (a.Impact / a.Duration));

    // Use single array optimization
    const dp = new Array(capacity + 1).fill(0);
    const selected = Array(n + 1)
        .fill()
        .map(() => new Array(capacity + 1).fill(false));

    // Build DP table with sorted tasks
    for (let i = 1; i <= n; i++) {
        const task = sortedTasks[i - 1];
        const duration = task.Duration;
        const impact = task.Impact;

        // Traverse backwards to avoid overwriting values we need
        for (let w = capacity; w >= duration; w--) {
            const newValue = dp[w - duration] + impact;
            if (newValue > dp[w]) {
                dp[w] = newValue;
                selected[i][w] = true;
            }
        }
    }

    // Backtrack to find selected tasks
    const selectedTasks = [];
    let w = capacity;
    
    for (let i = n; i > 0; i--) {
        if (selected[i][w]) {
            selectedTasks.push(sortedTasks[i - 1]);
            w -= sortedTasks[i - 1].Duration;
        }
    }

    return {
        maxImpact: dp[capacity],
        selectedTasks: selectedTasks.reverse()
    };
}