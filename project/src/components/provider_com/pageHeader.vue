<template>
  <div class="page-header bg-success text-white d-flex align-items-center">
    <h5 class="mb-0 fw-bold">{{ title }}</h5>
    <div class="profile">
      <i class="bi bi-bell-fill"></i>
      <img src="@/assets/images/avatar.jpg" alt="Profile" class="profile-img rounded-circle">
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
/* Entrance Animation */
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bellRing {
  0%, 100% {
    transform: rotate(0);
  }
  25% {
    transform: rotate(15deg);
  }
  75% {
    transform: rotate(-15deg);
  }
}

.page-header {
  min-height: 70px;
  padding: 0 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  background-color: #2d5016 !important;
  animation: slideInDown 0.4s ease-out;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h5 {
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 0.5px;
  color: white;
  align-items: center;
  margin-top:5px;
}

.profile {
  display: flex;
  align-items: center;
  gap: 15px;
}

.profile i {
  font-size: 1.25rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 50%;
  position: relative;
}

.profile i:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: scale(1.1);
}

.profile i:active {
  animation: bellRing 0.3s ease;
}

.profile i::after {
  content: '';
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background-color: #ff6b6b;
  border-radius: 50%;
  border: 2px solid #2d5016;
}

.profile-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.profile-img:hover {
  transform: scale(1.1);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .page-header {
    min-height: 60px;
    padding: 0 1rem;
  }

  .page-header h5 {
    font-size: 1rem;
  }

  .profile {
    gap: 10px;
  }

  .profile-img {
    width: 35px;
    height: 35px;
  }
}

@media (max-width: 576px) {
  .page-header {
    min-height: 55px;
    padding: 0 0.75rem;
  }

  .page-header h5 {
    font-size: 0.95rem;
  }

  .profile i {
    font-size: 1.1rem;
    padding: 6px;
  }

  .profile-img {
    width: 32px;
    height: 32px;
  }
}
</style>
