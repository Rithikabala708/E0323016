import axios from 'axios';

// Priority weights for notification types
const PRIORITY_WEIGHTS = {
  'Placement': 3,
  'Result': 2,
  'Event': 1
};

// Min-Heap class for efficiently maintaining top N notifications
class MinHeap {
  constructor(maxSize = 10) {
    this.heap = [];
    this.maxSize = maxSize;
  }

  // Calculate priority score: weight * recency_factor
  calculateScore(notification) {
    const weight = PRIORITY_WEIGHTS[notification.Type] || 1;
    const timestamp = new Date(notification.Timestamp).getTime();
    const now = Date.now();
    
    // Recency factor: newer notifications get higher scores
    // Decay over 7 days (604800000 ms)
    const ageInMs = now - timestamp;
    const recencyFactor = Math.max(0, 1 - (ageInMs / 604800000)); // 7 days
    
    // Final score: weight * 1000 + recency * 100
    // This ensures type priority is dominant, but recent items rank higher within same type
    return (weight * 1000) + (recencyFactor * 100);
  }

  // Get parent index
  parent(i) {
    return Math.floor((i - 1) / 2);
  }

  // Get left child index
  leftChild(i) {
    return 2 * i + 1;
  }

  // Get right child index
  rightChild(i) {
    return 2 * i + 2;
  }

  // Swap two elements
  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // Heapify up (bubble up)
  heapifyUp(index) {
    while (index > 0 && this.heap[index].score < this.heap[this.parent(index)].score) {
      this.swap(index, this.parent(index));
      index = this.parent(index);
    }
  }

  // Heapify down (bubble down)
  heapifyDown(index) {
    let smallest = index;
    const left = this.leftChild(index);
    const right = this.rightChild(index);

    if (left < this.heap.length && this.heap[left].score < this.heap[smallest].score) {
      smallest = left;
    }

    if (right < this.heap.length && this.heap[right].score < this.heap[smallest].score) {
      smallest = right;
    }

    if (smallest !== index) {
      this.swap(index, smallest);
      this.heapifyDown(smallest);
    }
  }

  // Insert notification into heap
  insert(notification) {
    const score = this.calculateScore(notification);
    const item = { ...notification, score };

    // If heap is not full, just add
    if (this.heap.length < this.maxSize) {
      this.heap.push(item);
      this.heapifyUp(this.heap.length - 1);
    } 
    // If new item has higher score than min, replace min
    else if (score > this.heap[0].score) {
      this.heap[0] = item;
      this.heapifyDown(0);
    }
  }

  // Get all items sorted by priority (highest first)
  getTopN() {
    // Extract all items and sort by score descending
    return this.heap
      .sort((a, b) => b.score - a.score)
      .map(({ score, ...notification }) => notification);
  }

  // Get current size
  size() {
    return this.heap.length;
  }
}

// Fetch notifications from API
async function fetchNotifications(token) {
  try {
    const response = await axios.get(
      'http://4.224.186.213/evaluation-service/notifications',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data.notifications || [];
  } catch (error) {
    console.error('Error fetching notifications:', error.response?.data || error.message);
    throw error;
  }
}

// Get top N priority notifications
export async function getTopPriorityNotifications(token, n = 10) {
  console.log(`\n🔔 Fetching notifications from API...`);
  
  const notifications = await fetchNotifications(token);
  console.log(`✅ Fetched ${notifications.length} notifications\n`);

  const heap = new MinHeap(n);

  // Process all notifications
  notifications.forEach(notification => {
    heap.insert(notification);
  });

  const topNotifications = heap.getTopN();
  
  console.log(`\n📌 Top ${n} Priority Notifications:\n`);
  console.log('=' .repeat(80));
  
  topNotifications.forEach((notif, index) => {
    const score = heap.calculateScore(notif);
    const priority = notif.Type === 'Placement' ? '🔴 HIGH' : 
                     notif.Type === 'Result' ? '🟡 MEDIUM' : '🟢 LOW';
    
    console.log(`\n${index + 1}. ${priority} | Type: ${notif.Type}`);
    console.log(`   Message: ${notif.Message}`);
    console.log(`   Time: ${notif.Timestamp}`);
    console.log(`   Score: ${score.toFixed(2)}`);
    console.log(`   ID: ${notif.ID}`);
  });
  
  console.log('\n' + '='.repeat(80));

  return topNotifications;
}

// Maintain top N with streaming updates (efficient for real-time)
export class PriorityInboxManager {
  constructor(maxSize = 10) {
    this.heap = new MinHeap(maxSize);
  }

  // Add new notification (O(log n))
  addNotification(notification) {
    this.heap.insert(notification);
  }

  // Get current top N (O(n log n))
  getTopNotifications() {
    return this.heap.getTopN();
  }

  // Batch add notifications (efficient initialization)
  addBatch(notifications) {
    notifications.forEach(notif => this.heap.insert(notif));
  }

  // Get current count
  getCount() {
    return this.heap.size();
  }
}

export default getTopPriorityNotifications;
