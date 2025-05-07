import { createRouter, createWebHistory } from "vue-router";
import ShakaPlayerView from "@/views/ShakaPlayerView.vue";
import MpegtsPlayerView from "@/views/MpegtsPlayerView.vue";
import { h } from "vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/index.html",
      component: {
        render() {
          const components = {
            ShakaPlayerView,
            MpegtsPlayerView,
          };
          const view = this.$route.query.view || "ShakaPlayerView";
          return h(components[view] || ShakaPlayerView);
        },
      },
    },
  ],
});

export default router;
