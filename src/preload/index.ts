import { contextBridge } from 'electron'
import { novelCraftApi } from './api'

contextBridge.exposeInMainWorld('novelcraft', novelCraftApi)
