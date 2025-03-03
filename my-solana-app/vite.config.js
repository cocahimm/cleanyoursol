import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { resolve } from 'path';
/* 
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Cho phép truy cập từ mọi IP
    port: 5173, // Đổi port nếu cần
    strictPort: true, // Cố định cổng, tránh bị đổi port khi cổng bị chiếm
    cors: true, // Cho phép yêu cầu từ domain khác
    hmr: {
      clientPort: 443, // Hỗ trợ HMR (Hot Module Replacement) trên HTTPS
    },
    allowedHosts: ["cleanyoursol.com", "www.cleanyoursol.com"],
  },
  resolve: {
    alias: {
      buffer: "buffer", // Thêm alias cho Buffer
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis", // Định nghĩa global như trên Node.js
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true, // Bật hỗ trợ Buffer
        }),
      ],
    },
  },
});
*/

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    cors: true,
    hmr: {
      clientPort: 443,
    },
    allowedHosts: ["cleanyoursol.com", "www.cleanyoursol.com"],
  },
  resolve: {
    alias: {
      buffer: "buffer",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        topvip: resolve(__dirname, "topvip.html"),
      },
    },
  },
});
/* cu 
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    cors: true,
    hmr: {
      clientPort: 443,
    },
    allowedHosts: ["cleanyoursol.com", "www.cleanyoursol.com"],
  },
  resolve: {
    alias: {
      buffer: "buffer",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "index.html", // Trang chính
        blog: "blog.html",  // Trang blog riêng
      },
      output: {
        entryFileNames: "[name].bundle.js", // Xuất file đúng tên
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
});

*/