# MapStyler - Custom Map Style Editor 🗺️

MapStyler is a browser-based map style editor, initially created to design a custom print and now shared as a fun, experimental project. While it started as a one-off project, I've tried to generalize it a bit for others to explore and customize their own maps.

## Try It Out 🚀

![mapstyler_demo](https://github.com/user-attachments/assets/6a831f03-206b-45ce-a4ea-dbfe169d321e)


Ready to start styling? Experiment with our live demo here: https://mapstyler.dev4pgh.com/
No account or signup is required - jump right in!

1. **Explore layers** in the collapsible sidebar
2. **Adjust styles** using:
   - Color pickers for fills/text
   - Sliders for line widths/sizes
   - Dropdowns for font selection
3. **Search Geographic locations** with the map search box (top right)
4. **Save/load** your custom styles using the toolbar

## Features 🌟

- **Layer customization** - Toggle visibility and style:
  - Road networks
  - Water features
  - Text labels
  - Boundaries & background
- **Real-time editing** - See changes immediately
- **Style management**:
  - Save/Load as JSON files
  - Browser session auto-save
  - Reset to default configuration

### Local Installation

To run MapStyler locally, you'll need Node.js and npm installed. Then:

```bash
git clone git@github.com:dev4pgh/mapstyler.git
cd mapstyler
npm install
npm run dev
```

## Acknowledgments 🙏

This project builds on excellent open source tools:
- Map data: [OpenFreeMap](https://openfreemap.org/)
- Rendering: [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js)
- Geocoding: [Photon](https://photon.komoot.io/)
- UI Components: [shadcn/ui](https://ui.shadcn.com/)

## About the Code 🛠️

This is a fun little project shared "as-is"! Originally developed for a specific need, I have tried to expand it to be more general-purpose. While functional and useful for map styling, it's still somewhat experimental, and should be viewed as a prototype. There may be a few rough edges.
- Might contain some bugs 🐛
- Code could use cleanup/refactoring
- Performance optimizations possible

Feel free to experiment and improve! (PRs welcome)

---

Made with ❤️ by [Dev4PGH](https://github.com/dev4pgh)
