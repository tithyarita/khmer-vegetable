<template>
  <div class="products-sell-analysis">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">Products Sell Analysis</h5>
      <span class="badge bg-secondary">This Year</span>
    </div>
    <div class="chart-container">
      <canvas ref="chartRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'

const chartRef = ref(null)
let chartInstance = null

onMounted(() => {
  if (chartRef.value) {
    chartInstance = new Chart(chartRef.value, {
      type: 'bar',
      data: {
        labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
        datasets: [
          {
            label: 'Chart Data',
            data: [1500, 1200, 1300, 1600, 1400, 1300, 1500, 1400, 1200, 1300, 1400, 1300],
            backgroundColor: ['#4169E1', '#00C851', '#4169E1', '#00C851', '#4169E1', '#00C851', '#4169E1', '#00C851', '#4169E1', '#00C851', '#4169E1', '#00C851'],
            borderRadius: 4,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 2000,
            ticks: {
              stepSize: 500
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    })
  }
})

</script>

<style scoped>
.products-sell-analysis {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.chart-container {
  position: relative;
  height: 300px;
  margin-top: 1rem;
}

h5 {
  font-weight: 600;
  color: #212529;
}

.badge {
  font-size: 0.75rem;
  padding: 0.4rem 0.8rem;
}

@media (max-width: 1024px) {
  .products-sell-analysis {
    padding: 1.25rem;
  }

  .chart-container {
    height: 250px;
  }
}

@media (max-width: 768px) {
  .products-sell-analysis {
    padding: 1rem;
  }

  .chart-container {
    height: 200px;
  }

  h5 {
    font-size: 1rem;
  }
}

@media (max-width: 576px) {
  .products-sell-analysis {
    padding: 0.75rem;
  }

  .chart-container {
    height: 180px;
  }

  h5 {
    font-size: 0.95rem;
  }

  .badge {
    font-size: 0.65rem;
  }
}
</style>
