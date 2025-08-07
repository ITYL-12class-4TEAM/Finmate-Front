<template>
  <div class="dual-bar-graph">
    <div class="bar-container">
      <div class="bar" :class="{ highlighted: ascore >= iscore }" :style="{ height: ascore + '%' }">
        <span class="label">A: {{ ascore }}</span>
      </div>
    </div>
    <div class="bar-container">
      <div class="bar" :class="{ highlighted: iscore > ascore }" :style="{ height: iscore + '%' }">
        <span class="label">I: {{ iscore }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DualBarGraph',
  props: {
    ascore: {
      type: Number,
      required: true,
    },
    iscore: {
      type: Number,
      required: true,
    },
  },
};
</script>

<style scoped>
.dual-bar-graph {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 12.5rem;
  width: 100%;
  border: 0.063rem solid #ccc;
  padding: 0.625 rem;
  box-sizing: border-box;
}

.bar-container {
  width: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bar {
  width: 100%;
  background-color: #007bff;
  transition: background-color 0.3s ease;
  position: relative;
}

.bar.highlighted {
  background-color: #ff5722;
}

.label {
  position: absolute;
  bottom: 100%;
  font-size: 0.875rem;
  color: #333;
  margin-bottom: 5px;
}
</style>
