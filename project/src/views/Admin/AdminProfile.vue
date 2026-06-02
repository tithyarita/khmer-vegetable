<template>
  <div class="profile-page">

    <!-- TOP BAR -->
    <div class="top-bar">
      <div>
        <h1>Account Information</h1>
        <p>Manage your admin profile</p>
      </div>

      <button class="logout-btn" @click="logout">
        Logout
      </button>
    </div>

    <!-- PROFILE CARD -->
    <div class="card">

      <!-- HEADER -->
      <div class="card-header">

        <div class="avatar-wrapper">
          <img
            :src="previewImage || admin.avatar || defaultAvatar"
            class="avatar"
          />

          <label class="upload-btn">
            Change Photo
            <input type="file" hidden @change="onImageChange" />
          </label>
        </div>

        <div class="user-info">
          <h2>{{ admin.name }}</h2>
          <p>{{ admin.role }}</p>
        </div>

        <button v-if="!isEditing" class="edit-btn" @click="startEdit">
          Edit Profile
        </button>

      </div>

      <!-- FORM -->
      <form v-if="isEditing" @submit.prevent="saveProfile" class="form-grid">

        <div class="field">
          <label>Full Name</label>
          <input v-model="form.name" type="text" required />
        </div>

        <div class="field">
          <label>Email</label>
          <input v-model="form.email" type="email" required />
        </div>

        <div class="field">
          <label>Phone</label>
          <input v-model="form.phone" type="text" />
        </div>

        <div class="field">
          <label>Address</label>
          <input v-model="form.address" type="text" />
        </div>

        <div class="field full">
          <label>New Password</label>
          <input v-model="form.password" type="password" />
        </div>

        <div class="actions full">
          <button type="submit" class="save-btn">Save Changes</button>
          <button type="button" class="cancel-btn" @click="cancelEdit">
            Cancel
          </button>
        </div>

      </form>

      <!-- VIEW MODE -->
      <div v-else class="info-grid">

        <div class="info">
          <label>Name</label>
          <p>{{ admin.name }}</p>
        </div>

        <div class="info">
          <label>Email</label>
          <p>{{ admin.email }}</p>
        </div>

        <div class="info">
          <label>Phone</label>
          <p>{{ admin.phone || '-' }}</p>
        </div>

        <div class="info">
          <label>Address</label>
          <p>{{ admin.address || '-' }}</p>
        </div>

      </div>

    </div>

  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AdminProfile",

  data() {
    return {
      isEditing: false,

      defaultAvatar:
        "https://cdn-icons-png.flaticon.com/512/149/149071.png",

      admin: {
        id: null,
        name: "",
        email: "",
        phone: "",
        address: "",
        role: "Administrator",
        avatar: "",
      },

      form: {
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
      },

      imageFile: null,
      previewImage: null,
    };
  },

  computed: {
    token() {
      return localStorage.getItem("token");
    },

    currentUser() {
      return JSON.parse(localStorage.getItem("user"));
    },
  },

  mounted() {
    this.loadProfile();
  },

  methods: {

    loadProfile() {
      if (!this.currentUser) return;

      this.admin = { ...this.currentUser };
    },

    startEdit() {
      this.form = {
        name: this.admin.name,
        email: this.admin.email,
        phone: this.admin.phone,
        address: this.admin.address,
        password: "",
      };

      this.isEditing = true;
    },

    cancelEdit() {
      this.isEditing = false;
      this.previewImage = null;
      this.imageFile = null;
    },

    onImageChange(e) {
      const file = e.target.files[0];
      if (!file) return;

      this.imageFile = file;
      this.previewImage = URL.createObjectURL(file);
    },

    async saveProfile() {
      try {
        const formData = new FormData();

        formData.append("name", this.form.name);
        formData.append("email", this.form.email);
        formData.append("phone", this.form.phone);
        formData.append("address", this.form.address);

        if (this.form.password) {
          formData.append("password", this.form.password);
        }

        if (this.imageFile) {
          formData.append("avatar", this.imageFile);
        }

        const res = await axios.put(
          `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/users/${this.admin.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        this.admin = res.data;

        localStorage.setItem("user", JSON.stringify(this.admin));

        this.isEditing = false;
        this.previewImage = null;
        this.imageFile = null;

        alert("Profile updated successfully");
      } catch (err) {
        console.log(err);
        alert("Update failed");
      }
    },

    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f6f8fb;
  padding: 40px;
  font-family: Arial;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.logout-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
}

.card {
  background: white;
  max-width: 900px;
  margin: auto;
  padding: 30px;
  border-radius: 18px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
}

.upload-btn {
  display: block;
  font-size: 12px;
  color: #16a34a;
  cursor: pointer;
  margin-top: 5px;
}

.user-info h2 {
  margin: 0;
}

.edit-btn {
  margin-left: auto;
  background: #16a34a;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.field {
  display: flex;
  flex-direction: column;
}

.field.full {
  grid-column: span 2;
}

.field input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
}

.actions {
  display: flex;
  gap: 10px;
}

.save-btn {
  background: #16a34a;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 10px;
}

.cancel-btn {
  background: #e5e7eb;
  border: none;
  padding: 10px;
  border-radius: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.info label {
  font-size: 12px;
  color: gray;
}

.info p {
  font-weight: bold;
}
</style>