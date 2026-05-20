<script setup>
import {
  ref,
  computed,
  onMounted,
} from "vue"

import axios from "axios"

import SideBar from "@/components/provider_com/sideBar.vue"
import PageHeader from "@/components/provider_com/pageHeader.vue"
import BankAccount from "@/components/provider_com/BankAccount.vue"

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

const currentUser = JSON.parse(
  localStorage.getItem("user")
)

const token =
  localStorage.getItem("token")

/*
|--------------------------------------------------------------------------
| PROVIDER STATE
|--------------------------------------------------------------------------
*/

const provider = ref({
  id: "",            // provider table id
  user_id: "",       // ⭐ FROM providers.user_id (THIS IS provider_id)
  farmName: "",
  email: "",
  location: "",
  createdAt: "",     // ⭐ FROM users.created_at
  avatar: "",
})

/*
|--------------------------------------------------------------------------
| EDIT STATE
|--------------------------------------------------------------------------
*/

const isEditing = ref(false)

const form = ref({
  farmName: "",
  email: "",
  location: "",
})

/*
|--------------------------------------------------------------------------
| STATS
|--------------------------------------------------------------------------
*/

const stats = ref([
  {
    title: "Active Services",
    value: 12,
    icon: "ri-briefcase-line",
  },
  {
    title: "Bookings",
    value: 89,
    icon: "ri-calendar-check-line",
  },
  {
    title: "Revenue",
    value: "$4,320",
    icon: "ri-money-dollar-circle-line",
  },
  {
    title: "Rating",
    value: "4.9 ★",
    icon: "ri-star-smile-line",
  },
])

/*
|--------------------------------------------------------------------------
| PROVIDER INITIAL
|--------------------------------------------------------------------------
*/

const providerInitial = computed(() => {
  return provider.value.farmName
    ? provider.value.farmName.charAt(0).toUpperCase()
    : "P"
})

/*
|--------------------------------------------------------------------------
| FORMAT DATE
|--------------------------------------------------------------------------
*/

const formatDate = (date) => {
  if (!date) return "N/A"
  return new Date(date).toLocaleDateString()
}

/*
|--------------------------------------------------------------------------
| FETCH PROVIDER (JOIN USERS + PROVIDERS)
|--------------------------------------------------------------------------
*/

const fetchProviderProfile = async () => {
  try {
    if (!currentUser) return

    const response = await axios.get(
      `http://localhost:3000/providers/${currentUser.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = response.data

    /*
      EXPECTED BACKEND JOIN RESULT:
      providers.user_id + users.created_at
    */

    provider.value = {
      id: data.user_id, // use user_id as provider id
      user_id: data.user_id,
      farmName:
        data.farm_name ||
        data.provider_name ||
        currentUser.name,
      email:
        data.email ||
        currentUser.email,
      location:
        data.location ||
        "Phnom Penh, Cambodia",
      createdAt:
        data.user && data.user.created_at ? data.user.created_at : "", // use user.created_at
      avatar:
        data.avatar || "",
    }

  } catch (error) {
    console.error("Fetch provider error:", error)
  }
}

/*
|--------------------------------------------------------------------------
| START EDIT
|--------------------------------------------------------------------------
*/

const startEdit = () => {
  form.value = {
    farmName: provider.value.farmName,
    email: provider.value.email,
    location: provider.value.location,
  }

  isEditing.value = true
}

/*
|--------------------------------------------------------------------------
| CANCEL EDIT
|--------------------------------------------------------------------------
*/

const cancelEdit = () => {
  isEditing.value = false
}

/*
|--------------------------------------------------------------------------
| SAVE PROFILE
|--------------------------------------------------------------------------
*/

const saveProfile = async () => {
  try {

    const payload = {
      farm_name: form.value.farmName,
      email: form.value.email,
      location: form.value.location,
    }

    await axios.put(
      `http://localhost:3000/providers/${provider.value.user_id}`, // ⭐ FIX: provider_id = user_id
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    provider.value = {
      ...provider.value,
      farmName: form.value.farmName,
      email: form.value.email,
      location: form.value.location,
    }

    isEditing.value = false

    alert("Profile updated successfully")

  } catch (error) {
    console.error("Update error:", error)
    alert("Failed to update profile")
  }
}

/*
|--------------------------------------------------------------------------
| MOUNT
|--------------------------------------------------------------------------
*/

onMounted(() => {
  fetchProviderProfile()
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

      <PageHeader
        title="Provider Profile"
      />

      <!-- HERO -->

      <section class="hero-section">

        <div class="hero-content">

          <!-- AVATAR -->

          <div
            v-if="provider.avatar"
            class="avatar-image"
          >

            <img
              :src="provider.avatar"
              alt="Provider"
            />

          </div>

          <div
            v-else
            class="avatar"
          >

            {{ providerInitial }}

          </div>

          <!-- INFO -->

          <div class="hero-info">

            <span class="badge">

              Provider Account

            </span>

            <h1>

              {{ provider.farmName }}

            </h1>

            <p>

              {{ provider.email }}

            </p>

            <!-- META -->

            <div class="meta-grid">

              <div class="meta-card">

                <span>
                  Provider ID
                </span>

                <strong>
                  #{{ provider.id }}
                </strong>

              </div>

              <div class="meta-card">

                <span>
                  Location
                </span>

                <strong>
                  {{ provider.location }}
                </strong>

              </div>

              <div class="meta-card">

                <span>
                  Created At
                </span>

                <strong>
                  {{
                    formatDate(
                      provider.createdAt
                    )
                  }}
                </strong>

              </div>

            </div>

          </div>

        </div>

        <!-- BUTTON -->

        <button
          v-if="!isEditing"
          class="edit-btn"
          @click="startEdit"
        >

          Edit Profile

        </button>

      </section>

      <!-- STATS -->

      <section class="stats-grid">

        <div
          v-for="(
            item,
            index
          ) in stats"

          :key="index"

          class="stats-card"
        >

          <div class="stats-icon">

            <i
              :class="item.icon"
            ></i>

          </div>

          <h2>
            {{ item.value }}
          </h2>

          <p>
            {{ item.title }}
          </p>

        </div>

      </section>

      <!-- CONTENT -->

      <section class="content-grid">

        <!-- LEFT -->

        <div class="left-column">

          <!-- PROFILE -->

          <div class="card">

            <div class="card-header">

              <div>

                <h3>
                  Profile Information
                </h3>

                <p>
                  Provider account details
                </p>

              </div>

            </div>

            <!-- VIEW MODE -->

            <div
              v-if="!isEditing"
              class="profile-list"
            >

              <div class="profile-item">

                <span>
                  Farm Name
                </span>

                <strong>
                  {{
                    provider.farmName
                  }}
                </strong>

              </div>

              <div class="profile-item">

                <span>
                  Email
                </span>

                <strong>
                  {{
                    provider.email
                  }}
                </strong>

              </div>

              <div class="profile-item">

                <span>
                  Location
                </span>

                <strong>
                  {{
                    provider.location
                  }}
                </strong>

              </div>

              <div class="profile-item">

                <span>
                  Created At
                </span>

                <strong>
                  {{
                    formatDate(
                      provider.createdAt
                    )
                  }}
                </strong>

              </div>

            </div>

            <!-- EDIT MODE -->

            <form
              v-else
              class="edit-form"
              @submit.prevent="
                saveProfile
              "
            >

              <div class="form-group">

                <label>
                  Farm Name
                </label>

                <input
                  v-model="
                    form.farmName
                  "
                  type="text"
                />

              </div>

              <div class="form-group">

                <label>
                  Email
                </label>

                <input
                  v-model="
                    form.email
                  "
                  type="email"
                />

              </div>

              <div class="form-group">

                <label>
                  Location
                </label>

                <input
                  v-model="
                    form.location
                  "
                  type="text"
                />

              </div>

              <div class="button-group">

                <button
                  type="submit"
                  class="save-btn"
                >

                  Save Changes

                </button>

                <button
                  type="button"
                  class="cancel-btn"
                  @click="
                    cancelEdit
                  "
                >

                  Cancel

                </button>

              </div>

            </form>

          </div>

        </div>

        <!-- RIGHT -->

        <div class="right-column">

          <div class="card">

            <div class="card-header">

              <div>

                <h3>
                  Bank Accounts
                </h3>

                <p>
                  Payment information
                </p>

              </div>

            </div>

            <BankAccount />

          </div>

        </div>

      </section>

    </main>

  </div>

</template>

<style scoped>

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

.provider-page{
  display:flex;
  min-height:100vh;
  background:#f4f7fb;
  font-family:"DM Sans",sans-serif;
}

/* SIDEBAR */

.sidebar{
  width:250px;
  background:white;
  border-right:1px solid #e5e7eb;
}

/* MAIN */

.main-content{
  flex:1;
  overflow-y:auto;
  padding-bottom:40px;
}

/* HERO */

.hero-section{
  margin:24px 30px;
  padding:32px;
  border-radius:28px;

  background:linear-gradient(
    135deg,
    #166534,
    #22c55e
  );

  color:white;

  display:flex;
  justify-content:space-between;
  align-items:center;
}

.hero-content{
  display:flex;
  align-items:center;
  gap:28px;
}

/* AVATAR */

.avatar,
.avatar-image{
  width:110px;
  height:110px;
  border-radius:50%;
  overflow:hidden;

  background:rgba(
    255,
    255,
    255,
    0.15
  );

  display:flex;
  align-items:center;
  justify-content:center;

  font-size:2.5rem;
  font-weight:700;
}

.avatar-image img{
  width:100%;
  height:100%;
  object-fit:cover;
}

/* INFO */

.badge{
  display:inline-block;
  padding:6px 14px;
  border-radius:999px;

  background:rgba(
    255,
    255,
    255,
    0.15
  );

  font-size:0.85rem;
}

.hero-info h1{
  margin-top:12px;
  font-size:2.2rem;
}

.hero-info p{
  margin-top:8px;
  opacity:0.9;
}

/* META */

.meta-grid{
  display:flex;
  gap:14px;
  flex-wrap:wrap;
  margin-top:20px;
}

.meta-card{
  background:rgba(
    255,
    255,
    255,
    0.12
  );

  padding:14px 18px;
  border-radius:16px;
  min-width:160px;
}

.meta-card span{
  display:block;
  font-size:0.8rem;
  opacity:0.8;
  margin-bottom:6px;
}

/* BUTTON */

.edit-btn,
.save-btn,
.cancel-btn{
  border:none;
  border-radius:14px;
  padding:13px 20px;
  cursor:pointer;
  font-weight:600;
}

.edit-btn,
.save-btn{
  background:white;
  color:#166534;
}

.cancel-btn{
  background:#e5e7eb;
}

.button-group{
  display:flex;
  gap:14px;
  margin-top:10px;
}

/* STATS */

.stats-grid{
  display:grid;
  grid-template-columns:
    repeat(4,1fr);

  gap:20px;
  padding:0 30px;
}

.stats-card{
  background:white;
  border-radius:24px;
  padding:24px;
}

.stats-icon{
  width:50px;
  height:50px;
  border-radius:14px;

  background:#f0fdf4;

  display:flex;
  align-items:center;
  justify-content:center;

  margin-bottom:18px;
}

.stats-icon i{
  color:#16a34a;
  font-size:1.3rem;
}

/* CONTENT */

.content-grid{
  display:grid;
  grid-template-columns:
    2fr 1fr;

  gap:24px;
  padding:24px 30px;
}

.left-column,
.right-column{
  display:flex;
  flex-direction:column;
  gap:24px;
}

/* CARD */

.card{
  background:white;
  border-radius:24px;
  padding:26px;
}

.card-header{
  margin-bottom:24px;
}

.card-header p{
  margin-top:6px;
  color:#6b7280;
}

/* PROFILE */

.profile-list{
  display:flex;
  flex-direction:column;
  gap:18px;
}

.profile-item{
  display:flex;
  justify-content:space-between;
  padding-bottom:16px;
  border-bottom:1px solid #f3f4f6;
}

/* FORM */

.edit-form{
  display:flex;
  flex-direction:column;
  gap:18px;
}

.form-group{
  display:flex;
  flex-direction:column;
}

.form-group label{
  margin-bottom:8px;
  color:#374151;
}

.form-group input{
  padding:14px;
  border:1px solid #d1d5db;
  border-radius:14px;
  outline:none;
}

.form-group input:focus{
  border-color:#16a34a;
}

/* RESPONSIVE */

@media(max-width:1100px){

  .content-grid{
    grid-template-columns:1fr;
  }

  .stats-grid{
    grid-template-columns:
      repeat(2,1fr);
  }

}

@media(max-width:768px){

  .sidebar{
    display:none;
  }

  .hero-section{
    flex-direction:column;
    align-items:flex-start;
    gap:20px;
  }

  .hero-content{
    flex-direction:column;
    align-items:flex-start;
  }

  .stats-grid{
    grid-template-columns:1fr;
  }

}
</style>