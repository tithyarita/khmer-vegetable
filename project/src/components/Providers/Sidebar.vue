<template>
  <aside class="sidebar">
    <h3 class="logo">Dashboard</h3>

    <ul>
      <li>Products</li>
      <li>Orders</li>
      <li>Revenue</li>
      <li class="active">Setting</li>
    </ul>
  </aside>
</template>

<style scoped>
.sidebar{
  width:220px;
  background:#fff;
  border-right:1px solid #eee;
  padding:20px;
}
ul{
  list-style:none;
  padding:0;
}
li{
  padding:12px 0;
  color:#777;
}
.active{
  color:#2e7d32;
  font-weight:bold;
}
.logo{
  margin-bottom:30px;
}
</style>