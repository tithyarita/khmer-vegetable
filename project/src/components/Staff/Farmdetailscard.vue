<template>
  <div class="card farm-card">
    <h3 class="card-title">Farm Details</h3>
    <div class="farm-icon-bg"><i class="bi bi-truck"></i></div>

    <div class="detail-row">
      <i class="bi bi-geo-alt detail-icon"></i>
      <div>
        <label class="field-label">LOCATION</label>
        <span class="field-value">{{ farm.address }}</span>
      </div>
    </div>

    <div class="detail-row">
      <i class="bi bi-rulers detail-icon"></i>
      <div>
        <label class="field-label">ACREAGE</label>
        <span class="field-value">{{ farm.acreage }}</span>
      </div>
    </div>

    <div class="detail-row">
      <i class="bi bi-flower1 detail-icon"></i>
      <div>
        <label class="field-label">PRIMARY CROPS</label>
        <div class="crop-tags">
          <span v-for="crop in farm.crops" :key="crop" class="crop-tag">
            {{ crop }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="farm.imageUrl" class="farm-image">
      <img :src="farm.imageUrl" :alt="farm.imageAlt || 'Farm photo'" />
    </div>
  </div>
</template>

<script>
export default {
  name: "FarmDetailsCard",
  props: {
    farm: {
      type: Object,
      required: true,
      // { address, acreage, crops: string[], imageUrl?, imageAlt? }
    },
  },
};
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  padding: 22px 24px;
}

.farm-card {
  position: relative;
  overflow: hidden;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 18px;
}

.farm-icon-bg {
  position: absolute;
  top: 18px;
  right: 18px;
  font-size: 42px;
  color: #ebebeb;
  pointer-events: none;
  line-height: 1;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.detail-icon {
  font-size: 15px;
  color: #6b7280;
  margin-top: 14px;
  flex-shrink: 0;
}

.field-label {
  display: block;
  font-size: 10px;
  color: #9aa0ab;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 3px;
}

.field-value {
  display: block;
  font-size: 13.5px;
  color: #1a1a2e;
  font-weight: 500;
  line-height: 1.4;
}

.crop-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.crop-tag {
  background: #e6f4ec;
  color: #2d7a4f;
  border-radius: 20px;
  padding: 3px 11px;
  font-size: 11.5px;
  font-weight: 600;
}

.farm-image {
  margin-top: 16px;
  border-radius: 10px;
  overflow: hidden;
  height: 120px;
}

.farm-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>