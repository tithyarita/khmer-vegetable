<template>
  <div class="box">
    <h3>Provider</h3>

    <div class="avatar">
      <img src="@/assets/images/avatar.jpg" alt="Provider Avatar">
      <i class="bi bi-pencil-square edit-icon"></i>
    </div>

    <div class="form">
        <label>Provider Name</label>
        <div class ="mini">
            <input v-model="name"/>
            <i class="bi bi-person edit-icon"></i>
        </div>

        <label>Farm Name</label>
        <div class ="mini">
            <input v-model="farm"/>
            <i class="bi bi-building edit-icon"></i>
        </div>

        <label>Location</label>
        <div class ="mini">
            <input v-model="location"/>
            <i class="bi bi-geo-alt edit-icon"></i>
        </div>

        <label>Farm Story</label>
        <textarea v-model="story"></textarea>
       

      <button>Save Changes</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue" //import { useProviderStore } from '@/stores/providerStore';

const name = ref("Sok Min")
const farm = ref("Ta Min Farm")
const location = ref("Phnom Penh")
const story = ref("TA MIN Farms began as a three-acre project dedicated to heirloom vegetable varieties. Today, we manage over 150 acres of certified organic land. Our mission is to reconnect consumers with thetrue flavor of the earth, utilizing regenerative practices that restore soil health and biodiversity. Every vegetable we provide is hand-harvested at peak nutritional density and delivered via carbon-neutral logistics.")
</script>

<style scoped>
.box{
  background:#fff;
  padding:25px;
  border-radius:18px;
  margin-bottom:25px;
  border: gray solid 3px;
  margin-top:20px;
}
.avatar{
  text-align:center;
}
.avatar img{
  width:120px;
  height:120px;
  border-radius:50%;
  border:4px solid #2e7d32;
}
.form{
  display:flex;
  flex-direction:column;
  gap:12px;
  margin-top:20px;
}
i{
    color:#2e7d32;
    position:relative;
    right:10px;
    left: -20px;
    cursor:pointer;
}
label{
    font-size:14px;
    color:#777;
    font-style: Plus Jakarta Sans;
}
h3{
    font-style: Plus Jakarta Sans;
    color:#2e7d32;
    font-weight: bold;
}
input{
    width:300px;
    height:150p;
    padding:10px;
    border-radius:8px;
    border:1px solid #ddd;
    background:#dcd6d6;
    font-weight:bold;
}
textarea{
    width:100%;
    height:100px;
    padding:10px;
    border-radius:8px;
    border:1px solid #ddd;
    background:#dcd6d6;
    font-style: Plus Jakarta Sans;
}
button{
  background:#2e7d32;
  color:white;
  border:none;
  padding:12px;
  border-radius:10px;
  margin-top:10px;
  cursor:pointer;
}
</style>