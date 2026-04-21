<template>
    <div class="card-wrap">
        <div class="card-farm">
            <div>
                <div class="header">
                    <span class="badge">✔ Verified Identity</span>
                    <div><strong>PASSWORD</strong><br><p>000111</p></div>
                </div>
                <h2>TA MIN FARM</h2>
                <p>Cultivating organic excellence since 1984 in Phnom Penh</p>

                <div class="info">
                    <div><strong>PROVIDER ID</strong><br><p>#V-10293</p></div>
                     <div><strong>JOINED SYSTEM</strong><br><p>Oct 12, 2023</p></div>
                      <div><strong>ID NUMBER</strong><br><p>1578234899</p></div>
                </div>
            </div>
            
        </div>

        <div class="image-card">
            <img src="@/assets/images/farm-image.jpg" alt="Farm Image">
            <p>Sustainability isn’t a goal. It’s our natural rhythm.</p>
        </div>
    </div>
</template>
<style scoped>
.card-wrap{
    display: flex;
    gap: 20px;
    align-items: stretch;
    
}
.card-farm{
    width:470px;
    flex: 1; /* Take up remaining space */
    background: linear-gradient(to bottom right , #fff 85%, #1aba37 100%);
    padding:10px;
    border-radius:8px;
    border: gray solid 1px;
    box-shadow:0 2px 5px rgba(0,0,0,0.1);
}
.image-card{
    width:300px;
    background:#fff;
    box-shadow:0 2px 5px rgba(0,0,0,0.1);
    position:relative;
    display: flex;
    flex-direction: column;
    img{
        width:100%;
        flex: 1;
        object-fit:cover;
        border-radius:8px;
        border: gray solid 1px;
        filter: brightness(0.7);
    }
    p{
        position: absolute;
        bottom: 20px;
        left: 10px;
        right: 10px;   
        padding:15px;
        font-size:14px;
        color:#fff;
        font-weight: bold;
        font-style: Plus Jakarta Sans;
        border-radius: 4px;
        
    }
}
.info{
    display: flex;
    gap: 30px;
    margin-top:20px;
    strong{
        color:darkgray;
        font-size:10px;
        font-style: Plus Jakarta Sans;
    }
    p{
        margin:0;
        font-size:14px;
        font-weight: bold;
    }
}
.badge{
  background:#e8f5e9;
  color:#2e7d32;
  padding:4px 4px;
  border-radius:20px;
  font-size:10px;
}
.header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    strong{
        color:darkgray;
        font-size:10px;
        font-style: Plus Jakarta Sans;
    }
    p{
        margin:0;
        font-size:14px;
        font-weight: bold;
    }
}
h2{
    font-weight: bold;
    font-style:Manrope;

}
</style>