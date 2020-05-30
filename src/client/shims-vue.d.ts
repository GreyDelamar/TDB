import Vue from 'vue'
import { AxiosStatic } from "axios";

declare module "*.vue" {
  export default Vue;
}

declare module 'vue/types/vue' {
  // 3. Declare augmentation for Vue
  interface VueConstructor {
    $http: AxiosStatic
  }
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    axios?: AxiosStatic
  }
}
