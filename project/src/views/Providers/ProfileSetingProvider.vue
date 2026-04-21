<script setup lang="ts">
import BankAccount from '@/components/Providers/BankAccount.vue';
import ProfileCard from '@/components/Providers/ProfileCard.vue';
import ProviderForm from '@/components/Providers/ProviderForm.vue';


</script>

<template>
    <div class="layout">
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
    gap:20px;
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
    i{
        font-size: 18px;
        color: #2e7d32;
        cursor: pointer;
    }
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