<script setup>
import { onMounted } from "vue"
import { useProviderStore } from "@/stores/providerStore"

import SideBar from '../../components/provider_com/sideBar.vue'
import PageHeader from '../../components/provider_com/pageHeader.vue'
import ProfileCard  from "../../components/provider_com/ProfileCard.vue"
import FormProvider from "../../components/provider_com/ProviderForm.vue"
import BankAccount  from "../../components/provider_com/BankAccount.vue"
const store       = useProviderStore()
const currentUser = JSON.parse(localStorage.getItem("user"))

const stats = [
  { title: "Active Services", value: 12,       icon: "ri-briefcase-line"           },
  { title: "Bookings",        value: 89,       icon: "ri-calendar-check-line"      },
  { title: "Revenue",         value: "$4,320", icon: "ri-money-dollar-circle-line" },
  { title: "Rating",          value: "4.9 ★",  icon: "ri-star-smile-line"          },
]

onMounted(async () => {
  if (!currentUser) return
  await store.loadProvider(currentUser.id)
})
</script>

<template>
  <div class="provider-page">

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <SideBar />
    </aside>

    <!-- MAIN -->
    <main class="main-content">
      <PageHeader title="Provider Profile" />

      <!-- ═══════════════════════════
           PROFILE CARD (avatar + farm)
      ═══════════════════════════ -->
      <section class="section-pad">
        <ProfileCard />
      </section>

      <!-- ═══════════════════════════
           STATS
      ═══════════════════════════ -->
      <section class="stats-grid section-pad">
        <div v-for="(item, i) in stats" :key="i" class="stats-card">
          <div class="stats-icon">
            <i :class="item.icon"></i>
          </div>
          <h2>{{ item.value }}</h2>
          <p>{{ item.title }}</p>
        </div>
      </section>

      <!-- ═══════════════════════════
           FORM + BANK ACCOUNTS
      ═══════════════════════════ -->
      <section class="content-grid section-pad">

        <!-- LEFT — Profile Form -->
        <div class="left-column">
          <FormProvider />
        </div>

        <!-- RIGHT — Bank Accounts -->
        <div class="right-column">
          <BankAccount />
        </div>

      </section>
    </main>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.provider-page {
  display: flex;
  min-height: 100vh;
  background: #f4f7fb;
  font-family: "DM Sans", sans-serif;
}

/* SIDEBAR */
.sidebar {
  width: 250px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;

  background: white;
  border-right: 1px solid #e5e7eb;

  overflow-y: auto;
  z-index: 1000;
}

/* MAIN */
.main-content {
  flex: 1;
  margin-left: 250px;

  min-height: 100vh;
  overflow-y: auto;

  padding-bottom: 40px;
}

/* spacing helper */
.section-pad {
  padding: 0 30px;
  margin-top: 24px;
}

/* STATS */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stats-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f0fdf4;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 16px;
}

.stats-icon i {
  color: #16a34a;
  font-size: 1.3rem;
}

.stats-card h2 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #111827;
}

.stats-card p {
  margin-top: 4px;
  color: #6b7280;
  font-size: 0.9rem;
}

/* CONTENT GRID */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* RESPONSIVE */
@media (max-width: 1100px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {

  .sidebar {
    display: none;
  }

  .main-content {
    margin-left: 0;
  }

  .section-pad {
    padding: 0 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>