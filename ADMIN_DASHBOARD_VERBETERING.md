# 🔧 Admin Dashboard Verbetering - Query Sources

## ❗ **Probleem Opgelost**

Je admin dashboard toonde lelijke, onleesbare data in de "Top 10 Query Sources" sectie.

---

## 🔄 **Voor vs Na**

### **VOOR (probleem):**
```
Top 10 Query Sources
{"type":"wetuitleg","searchResults":10,"hasGoogleResults":true}
33
{"type":"wetuitleg","searchResults":0,"hasGoogleResults":false}
22
{"jsonSources":[],"googleResults":"Used Google API","clientIp":"N/A"}
14
{"jsonSources":[{"naam":"Waterschapsblad","url":"https://www.officielebekendmakingen.nl"},{"naam":"W
12
95.179.238.47
7
45.77.140.111
7
```

### **NU (opgelost):**
```
Top 10 Query Sources (Gecategoriseerd)

┌─────────────────────────────────────────────────────────────┐
│ 🏷️ WetUitleg API           📊 33 vragen                    │
│ 10 zoekresultaten                                      #1  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🏷️ Ask API (JSON)          📊 22 vragen                    │
│ 0 juridische bronnen                                   #2  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🏷️ IP Adres                📊 14 vragen                    │
│ 95.179.238.47                                          #3  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🏷️ Corporate Network       📊 7 vragen                     │
│ corp-citrix-session...                                 #4  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ **Technische Implementatie**

### **1. Smart Source Parsing**
```typescript
function parseSourceData(sources: string | null): { category: string; detail: string } {
  // JSON detectie
  if (parsed.type === 'wetuitleg') {
    return { category: 'WetUitleg API', detail: `${parsed.searchResults} zoekresultaten` }
  }
  
  // IP adres detectie  
  const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/
  if (ipPattern.test(sources.trim())) {
    return { category: 'IP Adres', detail: sources.trim() }
  }
  
  // Corporate/Citrix detectie
  if (sources.includes('corp-') || sources.includes('citrix')) {
    return { category: 'Corporate Network', detail: sources.substring(0, 30) + '...' }
  }
}
```

### **2. Categorisatie & Groepering**
```typescript
// Groepeer vergelijkbare sources
const sourceCategories = new Map<string, { detail: string; count: number }>()

rawQuerySources.forEach(item => {
  const parsed = parseSourceData(item.sources)
  const key = parsed.category
  
  if (sourceCategories.has(key)) {
    existing.count += item._count // Tel bij elkaar op
  } else {
    sourceCategories.set(key, { detail: parsed.detail, count: item._count })
  }
})
```

### **3. Modern UI Design**
```tsx
<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
  <div className="flex-1">
    <div className="flex items-center gap-2 mb-1">
      <Badge variant="outline">{item.source}</Badge>
      <span className="text-sm font-bold">{item.count} vragen</span>
    </div>
    <p className="text-xs text-gray-600">{item.detail}</p>
  </div>
  <div className="text-lg font-mono font-bold text-blue-600">
    {item.count}
  </div>
</div>
```

---

## 📊 **Source Categorieën**

| **Categorie** | **Detectie** | **Voorbeeld Detail** |
|---------------|--------------|----------------------|
| **WetUitleg API** | `"type":"wetuitleg"` | "10 zoekresultaten" |
| **Ask API (JSON)** | `jsonSources` array | "3 juridische bronnen" |
| **IP Adres** | IP pattern `xxx.xxx.xxx.xxx` | "95.179.238.47" |
| **Corporate Network** | `corp-`, `citrix` | "corp-session-abc123..." |
| **API Tracking** | `apiEndpoint` | "Enhanced tracking data" |
| **Onbekend** | Null/empty | "Geen tracking data" |

---

## ✅ **Voordelen Nieuwe Weergave**

### **Voor Admins:**
- ✅ **Leesbare categorieën** in plaats van raw JSON
- ✅ **Gegroepeerde data** - vergelijkbare sources bij elkaar
- ✅ **Visuele hiërarchie** met badges en kleuren
- ✅ **Snelle insights** - zie direct waar traffic vandaan komt

### **Voor Debugging:**
- ✅ **Duidelijke API identificatie** (Ask vs WetUitleg)
- ✅ **Corporate network detection** (Citrix traffic zichtbaar)
- ✅ **IP tracking** voor anonieme gebruikers
- ✅ **Source quality** - zie welke APIs goed functioneren

### **Voor Monitoring:**
- ✅ **Trends herkennen** - welke APIs worden het meest gebruikt
- ✅ **Anomalieën spotten** - onverwachte traffic bronnen
- ✅ **Performance metrics** - search results per categorie
- ✅ **User behavior** - corporate vs consumer usage

---

## 🎯 **Praktisch Gebruik**

### **Scenario 1: Corporate Traffic Analyse**
```
🏷️ Corporate Network    📊 45 vragen
citrix-session-abc123...

→ Insight: Veel zakelijk gebruik via Citrix
→ Actie: Mogelijk betere corporate licenties aanbieden
```

### **Scenario 2: API Performance Check**
```
🏷️ WetUitleg API       📊 150 vragen  
12 zoekresultaten

🏷️ Ask API (JSON)      📊 89 vragen
3 juridische bronnen

→ Insight: WetUitleg populairder, Ask heeft minder bronnen
→ Actie: Ask API bronnen uitbreiden
```

### **Scenario 3: Tracking Gaps Detectie**
```
🏷️ Onbekend           📊 23 vragen
Geen tracking data

→ Insight: 23 vragen zonder proper tracking
→ Actie: Improved tracking implementatie checken
```

---

## 🔮 **Toekomstige Uitbreidingen**

- **Real-time updates** - Live dashboard met WebSocket
- **Geographical mapping** - IP adressen op wereldkaart
- **Time-based analysis** - Trends over tijd per categorie
- **Performance correlation** - Response times per source type
- **User journey tracking** - Van bron naar conversie

---

**🎉 Het admin dashboard is nu veel professioneler en bruikbaarder voor monitoring en debugging!** 