import {createToast} from "mosha-vue-toastify";

export function useHelpers() {
    const createTypedToaster = (msg: string, type: 'default' | 'info' | 'warning' | 'danger' | 'success') => {
        createToast(msg, {
            position: 'bottom-right',
            type,
            transition: 'slide',
        })
    }
return {createTypedToaster}
}
