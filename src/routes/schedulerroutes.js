import express from "express";
import { Log } from "../utils/logger.js";
import { getToken } from "../services/auth.js";
import { getDepots } from "../services/depotservices.js";
import { getVehicles } from "../services/vechicleservices.js";
import { knapsack } from "../utils/kanpsack.js";

const router = express.Router();

// Cache for depot and vehicle data
let cachedData = null;
let cacheTime = null;
const CACHE_DURATION = 30000; // 30 seconds cache

// Test endpoint to see raw data
router.get("/test-data", async (req, res) => {
  try {
    const depotsData = await getDepots();
    const vehiclesData = await getVehicles();
    
    res.json({
      depots: depotsData,
      vehicles: vehiclesData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/schedule", async (req, res) => {
  try {
    let { depotID } = req.body;

    if (!depotID) {
      return res.status(400).json({
        error: "DepotID is required"
      });
    }

    // Ensure depotID is a number for comparison
    depotID = parseInt(depotID);

    // Use cache if available and fresh
    let depotsData, vehiclesData;
    const now = Date.now();
    
    if (cachedData && cacheTime && (now - cacheTime < CACHE_DURATION)) {
      console.log("Using cached data");
      depotsData = cachedData.depots;
      vehiclesData = cachedData.vehicles;
    } else {
      console.log("Fetching fresh data...");
      // Parallel API calls for speed
      [depotsData, vehiclesData] = await Promise.all([
        getDepots(),
        getVehicles()
      ]);
      
      // Update cache
      cachedData = { depots: depotsData, vehicles: vehiclesData };
      cacheTime = now;
    }

    // Find the specific depot
    const depot = depotsData.depots.find(d => d.ID === depotID);
    
    if (!depot) {
      return res.status(404).json({
        error: "Depot not found",
        availableDepots: depotsData.depots.map(d => d.ID)
      });
    }

    // All tasks from the vehicles endpoint
    const allTasks = vehiclesData.vehicles;

    console.log(`Knapsack: ${allTasks.length} tasks, capacity: ${depot.MechanicHours}`);

    // Run knapsack algorithm
    const result = knapsack(allTasks, depot.MechanicHours);

    // Calculate totals
    const totalDuration = result.selectedTasks.reduce((sum, task) => sum + task.Duration, 0);
    const totalImpact = result.maxImpact;

    console.log(`Selected ${result.selectedTasks.length} tasks, impact: ${totalImpact}, duration: ${totalDuration}`);

    // Log asynchronously (don't wait for it)
    Log(
      "backend",
      "info",
      "service",
      `Scheduled ${result.selectedTasks.length} tasks`,
      getToken()
    ).catch(err => console.error("Logging failed:", err.message));

    res.status(200).json({
      depotID,
      mechanicHours: depot.MechanicHours,
      scheduledVehicles: result.selectedTasks,
      totalImpact,
      totalDuration
    });

  } catch (err) {
    console.error("Error:", err);

    res.status(500).json({
      error: "Internal Server Error",
      message: err.message
    });
  }
});

export default router;