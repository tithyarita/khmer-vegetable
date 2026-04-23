<script setup lang="ts">
import SideBar from '@/components/provider_com/sideBar.vue';
import PageHeader from '@/components/provider_com/pageHeader.vue';
import BankAccount from '@/components/provider_com/BankAccount.vue';
import ProfileCard from '@/components/provider_com/ProfileCard.vue';
import ProviderForm from '@/components/provider_com/ProviderForm.vue';
</script>

<template>
    <div class="provider-layout">
        <div class="sidebar-wrapper">
            <SideBar />
        </div>
        <div class="main-content">
            <PageHeader title="Provider Profile" />
            <div class="content-wrapper">
                <ProfileCard class="profile-card" />
                <ProviderForm />
                <BankAccount />
            </div>
        </div>
    </div>
</template>

<style scoped>

.provider-layout {
    display: flex;
    height: 100vh;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
}

.sidebar-wrapper {
    width: 250px;
    height: 100%;
    overflow-y: auto;
    flex-shrink: 0;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
}

.content-wrapper {
    padding: 50px;
    overflow-y: auto;
    flex: 1;
}



/* Tablet */
@media (max-width: 768px) {
    .provider-layout {
        flex-direction: column;
        height: auto;
        position: relative;
    }

    .sidebar-wrapper {
        width: 100%;
        height: auto;
        max-height: 200px;
    }

    .main-content {
        height: auto;
    }

    .content-wrapper {
        padding: 20px;
    }
}

/* Mobile */
@media (max-width: 576px) {
    .content-wrapper {
        padding: 15px;
    }
}
</style>