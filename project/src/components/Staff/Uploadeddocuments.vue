<template>
  <div class="card">
    <div class="header-row">
      <div>
        <h3 class="card-title">Uploaded Documents</h3>
        <p class="card-subtitle">Review legal certificates and food safety filings.</p>
      </div>
      <div class="files-badge">
        <i class="bi bi-paperclip"></i>
        {{ documents.length }} Files Attached
      </div>
    </div>

    <div class="docs-grid">
      <div
        v-for="doc in documents"
        :key="doc.name"
        class="doc-item"
        @click="$emit('open', doc)"
      >
        <div class="doc-icon-wrap" :class="iconClass(doc.type)">
          <i :class="iconName(doc.type)"></i>
        </div>
        <span class="doc-name">{{ doc.name }}</span>
        <span class="doc-meta">{{ doc.meta }}</span>
        <button class="doc-action" @click.stop="$emit('action', doc)">
          <i :class="doc.type === 'image' ? 'bi bi-eye' : 'bi bi-box-arrow-up-right'"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UploadedDocuments",
  emits: ["open", "action"],
  props: {
    documents: {
      type: Array,
      required: true,
      // [{ name, meta, type: 'pdf'|'image'|'doc'|'other', verified?: string }]
    },
  },
  methods: {
    iconName(type) {
      const map = {
        pdf:   "bi bi-file-earmark-pdf",
        image: "bi bi-file-earmark-image",
        doc:   "bi bi-file-earmark-text",
        other: "bi bi-file-earmark",
      };
      return map[type] ?? map.other;
    },
    iconClass(type) {
      const map = {
        pdf:   "icon-red",
        image: "icon-green",
        doc:   "icon-blue",
        other: "icon-orange",
      };
      return map[type] ?? map.other;
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

.header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 3px;
}

.card-subtitle {
  font-size: 12px;
  color: #9aa0ab;
  margin: 0;
}

.files-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #e6f4ec;
  color: #2d7a4f;
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.docs-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.doc-item {
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.doc-item:hover {
  border-color: #c4c9d4;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.doc-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.icon-red    { background: #fde8ef; color: #c0392b; }
.icon-blue   { background: #dbeafe; color: #1d4ed8; }
.icon-green  { background: #d4edda; color: #276541; }
.icon-orange { background: #fff3cd; color: #856404; }

.doc-name {
  font-size: 11px;
  font-weight: 600;
  color: #1a1a2e;
  word-break: break-all;
  line-height: 1.35;
}

.doc-meta {
  font-size: 10px;
  color: #9aa0ab;
  line-height: 1.3;
}

.doc-action {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  color: #9aa0ab;
  padding: 2px;
  margin-top: 2px;
  transition: color 0.15s;
  line-height: 1;
}

.doc-action:hover {
  color: #1a1a2e;
}
</style>