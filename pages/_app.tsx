import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps<{}>) {
  useEffect(() => {
    // 修改 Next.js 开发工具中的 paused 状态标记
    const updatePausedElement = () => {
      // 方法1: 查找所有包含 "paused" 类的元素
      const pausedElements = document.querySelectorAll('[class*="paused"], .paused');
      pausedElements.forEach((element) => {
        const el = element as HTMLElement;
        // 设置背景色
        el.style.backgroundColor = "#dbeafe";
        el.style.color = "#1e3a8a";
        
        // 替换文本内容中的 N 为 M
        if (el.textContent?.trim() === "N" || el.textContent?.includes("N")) {
          el.textContent = el.textContent.replace(/N/g, "M");
        }
        
        // 遍历所有子节点（包括文本节点）
        const walker = document.createTreeWalker(
          el,
          NodeFilter.SHOW_TEXT,
          null
        );
        let node;
        while ((node = walker.nextNode())) {
          if (node.textContent?.includes("N")) {
            node.textContent = node.textContent.replace(/N/g, "M");
          }
        }
      });

      // 方法2: 在 nextjs-portal 中查找
      const portal = document.querySelector("nextjs-portal");
      if (portal) {
        const allElements = portal.querySelectorAll("*");
        allElements.forEach((element) => {
          const el = element as HTMLElement;
          // 如果元素只包含文本 "N"
          if (el.textContent?.trim() === "N") {
            el.textContent = "M";
            el.style.backgroundColor = "#dbeafe";
            el.style.color = "#1e3a8a";
          }
          // 如果元素包含 "N"
          else if (el.textContent?.includes("N") && el.textContent.length < 10) {
            el.textContent = el.textContent.replace(/N/g, "M");
            if (el.className.includes("paused") || el.getAttribute("class")?.includes("paused")) {
              el.style.backgroundColor = "#dbeafe";
              el.style.color = "#1e3a8a";
            }
          }
        });
      }
    };

    // 延迟执行，确保 DOM 已加载
    const timeoutId = setTimeout(updatePausedElement, 100);
    
    // 使用 MutationObserver 监听整个 document 的变化
    const observer = new MutationObserver(() => {
      updatePausedElement();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    // 定期检查（作为备用方案）
    const intervalId = setInterval(updatePausedElement, 500);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      observer.disconnect();
    };
  }, []);

  return (
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
  );
}
