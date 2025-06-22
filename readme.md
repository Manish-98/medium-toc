# 📚 medium-toc [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE) 

Automatically generate a **Table of Contents (TOC)** for Medium-style blog posts.

## 🚀 Purpose

* Streamlines the creation of clickable TOCs for Medium or Medium-like articles.
* Parses a Medium post’s html DOM to extract headings (e.g. `<h1>`, `<h2>`).
* Inserts a structured TOC at the top of the post in Markdown or HTML format.
* Especially useful for bloggers, content creators, and static-site users who need easy navigation for long-form posts.

## 🧰 How It Works

1. **Get HTML content**
   The extension gets the content of the blog post on medium.

2. **Parse Content**
   It uses a parser to scan the HTML content and identify heading tags.

3. **Generate TOC**
   A nested list of headings is built—preserving hierarchy (H1 → H2) and links.

4. **Insert TOC**
   The generated TOC snippet is inserted into the blog post DOM.


---


## 📝 Usage

* open `chrome://extensions/` or `brave://extensions/`
* Switch on developer mode
* Click `Load unpacked`
* Select the root folder of this extension
* Pin the extension in the extensions menu in the browser


---

## 📄 Output Example

![Sample TOC](/sample-toc.png)

---

## Additional features

✨ Configurable TOC size — Choose between full or minimized view as the default

🔗 Quick access to all links — View all external links from the blog in one place

🧘‍♂️ Focus Mode — Remove distractions and view just the content and TOC for immersive reading

---

## 🚧 Why Use This?

* Manually building TOC for long posts is tedious.
* Ensures consistency in formatting and nesting.
* Supports internal HTML anchors for smooth navigation.

---

## 🧑‍💻 Contributing

PRs welcome! Feel free to add:

* Support for deeper heading levels (H3+)
* Any new feature ideas!

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

Let me know if you'd like to adjust formatting, add usage examples, or add some other features.