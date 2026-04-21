<script setup lang="ts">
import BankAccount from '@/components/Providers/BankAccount.vue';
import ProfileCard from '@/components/Providers/ProfileCard.vue';
import ProviderForm from '@/components/Providers/ProviderForm.vue';
import Sidebar from '@/components/Providers/Sidebar.vue';

</script>

<template>
    <div class="layout">
        <!-- <Sidebar /> -->
        <div class="main-contant">
            <div class="header">
                <h2>Provider Profile</h2>
                <div class="right">
                    <i class="bi bi-bell"></i>
                    <p>Sok Min</p>
                    <img src="@/assets/images/avatar.jpg" alt="Avatar" />
                </div>
            </div>

            <ProfileCard />
            <ProviderForm />
            <BankAccount />
        </div>
    </div>
</template>

<style>   
.layout{
    display: flex;
    min-height: 100vh;
    margin:center;
}
.header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    h2{
        font-weight: bold;
        font-style:Manrope;
    }
}
.header .right{
    display: flex;
    align-items: center;
    gap: 15px;
}
.header .right p{
    margin:0;
    font-weight: bold;
}
.header .right img{
    width:40px;
    height:40px;
    border-radius:50%;
}
</style>