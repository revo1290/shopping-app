<script setup>
defineProps({
  stats: {
    type: Object,
    default: () => ({})
  }
})
</script>

<template>
  <div class="stats-panel" v-if="stats" role="region" aria-label="統計情報">
    <div class="stat-card total" role="group" :aria-label="`登録商品: ${stats.total || 0}件`">
      <div class="stat-icon" aria-hidden="true">📋</div>
      <div class="stat-info">
        <div class="stat-value">{{ stats.total || 0 }}</div>
        <div class="stat-label">登録商品</div>
      </div>
    </div>

    <div class="stat-card remaining" role="group" :aria-label="`未購入: ${stats.remaining || 0}件`">
      <div class="stat-icon" aria-hidden="true">🛒</div>
      <div class="stat-info">
        <div class="stat-value">{{ stats.remaining || 0 }}</div>
        <div class="stat-label">未購入</div>
      </div>
    </div>

    <div class="stat-card purchased" role="group" :aria-label="`購入済み: ${stats.purchased || 0}件`">
      <div class="stat-icon" aria-hidden="true">✅</div>
      <div class="stat-info">
        <div class="stat-value">{{ stats.purchased || 0 }}</div>
        <div class="stat-label">購入済み</div>
      </div>
    </div>

    <div class="stat-card low-stock" :class="{ warning: stats.lowStock > 0 }" role="group" :aria-label="`在庫少: ${stats.lowStock || 0}件${stats.lowStock > 0 ? '（注意）' : ''}`">
      <div class="stat-icon" aria-hidden="true">⚠️</div>
      <div class="stat-info">
        <div class="stat-value">{{ stats.lowStock || 0 }}</div>
        <div class="stat-label">在庫少</div>
      </div>
    </div>

    <div class="stat-card urgent" :class="{ warning: stats.urgent > 0 }" role="group" :aria-label="`期限間近: ${stats.urgent || 0}件${stats.urgent > 0 ? '（注意）' : ''}`">
      <div class="stat-icon" aria-hidden="true">🔥</div>
      <div class="stat-info">
        <div class="stat-value">{{ stats.urgent || 0 }}</div>
        <div class="stat-label">期限間近</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.warning {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
}

.stat-icon {
  font-size: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}
</style>
