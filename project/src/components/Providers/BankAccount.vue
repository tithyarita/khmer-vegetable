<template>
  <div class="box">
    <div class="banking">
        <i class="bi bi-bank2"></i>
        <h3>Bank Account</h3>
        <div class="add-bank">
            <i class="bi bi-plus"></i>
        </div>
    </div>

    <div class="banks">
      <div class="bank">
        <div class="bank-name">
            <p>ABA</p>
            <strong>1234 1234 1234</strong>
        </div>
        <p>QR Code</p>
        <img src="@/assets/images/QR.jpg"/>
      </div>

      <div class="bank">
        <div class="bank-name">
            <p>ACLEDA</p>
            <strong>1234 1234 1234</strong>
        </div>
        <p>QR Code</p>
        <img src="@/assets/images/QR.jpg"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.box{
  background:#fff;
  padding:25px;
  margin-top:20px;
}
.banking{
    display:flex;
    align-items:center;
    gap:10px;
}
.bank-name{
    display:flex;
    flex-direction:row;
    gap:10px;
    margin-bottom:10px;
    background:#dcd6d6;
    padding:10px;
    border-radius:8px;
    p{
        font-weight: bold;
        font-style: Plus Jakarta Sans;
    }
}
.add-bank{
    margin-left:auto;
    background:#2e7d32;
    color:white;
    width:30px;
    height:30px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:50%;
    cursor:pointer;
}
i{
    font-size:18px;
}
.banks{
  display:flex;
  gap:40px;
  align-items:center;
  margin-top:20px;
}
.bank{
    text-align:center;
    p{
        font-style: Plus Jakarta Sans;
        color:#777;
    }
}
.bank img{
  margin-top:10px;
  width:150px;
    height:150px;
}
</style>