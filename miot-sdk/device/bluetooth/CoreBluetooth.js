/**
 * @export public
 * @doc_name 蓝牙服务-特征模块
 * @doc_index 5
 * @doc_directory bluetooth
 * @module miot/device/bluetooth
 * @description 蓝牙服务/特征操作类
 * 蓝牙的开发，详见标准蓝牙BLE开发指南：https://iot.mi.com/new/doc/05-%E7%B1%B3%E5%AE%B6%E6%89%A9%E5%B1%95%E7%A8%8B%E5%BA%8F%E5%BC%80%E5%8F%91%E6%8C%87%E5%8D%97/04-%E8%AE%BE%E5%A4%87%E7%AE%A1%E7%90%86/03-%E6%8C%89%E8%AE%BE%E5%A4%87/02-%E8%93%9D%E7%89%99%E5%BC%80%E5%8F%91%E6%8C%87%E5%8D%97/03-%E6%A0%87%E5%87%86%E8%93%9D%E7%89%99BLE%E5%BC%80%E5%8F%91%E6%8C%87%E5%8D%97.html。
 * 本文件提供了蓝牙服务（Service）和蓝牙特征值（Characteristic）的读写监听方面的操作
 * 蓝牙的开发简化流程为：发现设备 - 连接设备 - 发现服务 - 发现特征值 - 特征值读写 - 断开连接,本文件主要涉及到发现服务 - 发现特征值 - 特征值读写这么几步
 * 
 * @example
 *
 *  import {Bluetooth} from 'miot/device/bluetooth'
 *
 *  ...
 *  ble = Bluetooth.createBluetoothLE(result.uuid || result.mac);//android 用 mac 创建设备，ios 用 uuid 创建设备
 * 
    const charac = ble.getService('...').getCharacteristic('...')
    charac.read().then(characteristic=>{characteristic.value ... }).catch(err=>{});
    charac.write().then(characteristic=>{}).catch(err=>{})
 *  ...
 */
import native, { Properties } from '../../native';
import { getBluetoothUUID128 } from './index';
/**
 * BLE蓝牙特征值
 * @interface
 *
 */
export class IBluetoothCharacteristic {
    /**
     * 是否已经被发现，只有已经被发现的特征值才可以真正操作读写，如果蓝牙断开连接了，isDiscovered为false
     * @member
     * @type {boolean}
     * @readonly
     *
     */
    get isDiscovered() {
        //@native => false
        return Properties.of(this).isDiscovered;
    }
    /**
     * 数值是否已经加载, 为 true 时,本类才能读到正确的 value。read/write/writeWithoutResponse等方法的成功调用，bluetoothCharacteristicValueChanged事件执行，都会将此属性置为true
     * @member
     * @type {boolean}
     * @readonly
     *
     */
    get isValueLoaded() {
        //@native => false
        return Properties.of(this).isValueLoaded;
    }
    /**
     * 特征值的 UUID
     * @member
     * @type {string}
     * @readonly
     *
     */
    get UUID() {
        //@native => ""
        return Properties.of(this).characteristicUUID;
    }
    /**
     * 数值, 配合 isValueLoaded 使用
     * @member
     * @type {*}
     * @returns hexstring
     * @readonly
     * @example
     *
     *   ...
     *   if(charateristic.isValueLoaded){
     *       const val = characteristic.value;
     *       ...
     *   }
     *   ...
     *
     */
    get value() {
        //@native => null
        return Properties.of(this).value;
    }
    /**
     * 读取蓝牙数据
     * @method
     * @returns {Promise<IBluetoothCharacteristic>} 
     *      resolve： 返回当前对象，value为读取到的value
     *      reject：100:设备正在连接中  101:设备不存在  102:服务或者特征值未发现
     */
    read() {
        //@native :=> promise
        //@mark andr done
        //@mark iOS done
        return new Promise((resolve, reject) => {
            const self = Properties.of(this);
            const { fakemac, serviceUUID, characteristicUUID } = self;
            native.MIOTBluetooth.readHexStringWithCallback(fakemac.id, characteristicUUID, serviceUUID, (ok, data) => {
                if (ok) {
                    self.value = data;
                    self.isValueLoaded = true;
                    resolve(self);
                    return;
                }
                reject(data);
            });
        });
        //@native end
    }
    /**
     * 写数据
     * 对应 writeWithResponse
     * @method
     * @param {*} value hexstring
     * @returns {Promise<IBluetoothCharacteristic>}
     *      resolve： 返回当前对象，value为成功写入的value
     *      reject：100:设备正在连接中  102:服务或者特征值未发现
     */
    write(value) {
        //@native :=> promise
        //@mark andr done
        //@mark iOS done
        return new Promise((resolve, reject) => {
            const self = Properties.of(this);
            const { fakemac, serviceUUID, characteristicUUID } = self;
            native.MIOTBluetooth.writeHexStringWithCallback(fakemac.id, value, characteristicUUID, serviceUUID, 0, (ok, error) => {
                if (ok) {
                    self.value = value;
                    self.isValueLoaded = true;
                    resolve(this);
                    return;
                }
                reject(error);
            });
        });
        //@native end
    }
    /**
     * 直接写数据
     * 对应 writeWithoutResponse
     * @method
     * @param {*} value
     * @returns {Promise<IBluetoothCharacteristic>}
     *      resolve： 返回当前对象，value为成功写入的value
     *      reject：{code: xxx, message: xxx} 100:设备正在连接中  102:服务或者特征值未发现
     */
    writeWithoutResponse(value) {
        //@native :=> promise
        //@mark andr done
        //@mark iOS  done
        return new Promise((resolve, reject) => {
            const self = Properties.of(this);
            const { fakemac, serviceUUID, characteristicUUID } = self;
            native.MIOTBluetooth.writeHexStringWithCallback(fakemac.id, value, characteristicUUID, serviceUUID, 1, (ok, error) => {
                if (ok) {
                    self.value = value;
                    self.isValueLoaded = true;
                    resolve(this);
                    return;
                }
                reject(error);
            });
        });
        //@native end
    }
    /**
     * 设置数值变化监听开关，如果成功监听了，可以接收到属性变化事件bluetoothCharacteristicValueChanged
     * @method
     * @param {boolean} flag -true 打开监听, false 则关闭监听
     * @example
     * ...
     *     import {BluetoothEvent} from 'miot/device/bluetooth'
     * 
     *     character.setNotify(true).then(()=>{console.log("success")});
     * 
     *     BluetoothEvent.bluetoothCharacteristicValueChanged.addListener((bluetooth, service, character, value) => {
            if (character.UUID.indexOf("ffd5")>0){
                console.log("bluetoothCharacteristicValueChanged", character.UUID, value);
            }
        }) 
     * ...
     * 
     * @returns {Promise<IBluetoothCharacteristic>}
     *      resolve：当前对象
     *      reject：{code: xxx, message: xxx}  100:设备正在连接中  102:服务或者特征值未发现
     */
    setNotify(flag) {
        //@native :=> promise
        //@mark andr done
        //@mark iOS done
        if (native.isAndroid) {
            return new Promise((resolve, reject) => {
                const self = Properties.of(this);
                const { fakemac, serviceUUID, characteristicUUID } = self;
                native.MIOTBluetooth.setNotifyWithCallback(fakemac.id, flag, characteristicUUID, serviceUUID, (ok, error) => {
                    if (ok) {
                        resolve(this);
                    } else {
                        // 如果失败，在进行一次indicate
                        native.MIOTBluetooth.setIndicationWithCallback(fakemac.id, flag, characteristicUUID, serviceUUID, (ok, error) => {
                            if (ok) {
                                resolve(this);
                                return;
                            }
                            reject(error);
                        });
                    }
                });
            });
        } else {
            return new Promise((resolve, reject) => {
                const self = Properties.of(this);
                const { fakemac, serviceUUID, characteristicUUID } = self;
                native.MIOTBluetooth.setNotifyWithCallback(fakemac.id, flag, characteristicUUID, serviceUUID, (ok, error) => {
                    if (ok) {
                        resolve(this);
                        return;
                    }
                    reject(error);
                });
            });
        }
        //@native end
    }
}
/**
 * BLE蓝牙服务类
 * @interface
 *
 */
export class IBluetoothService {
    /**
     * 蓝牙服务 UUID
     * @member
     * @type {string}
     * @readonly
     *
     */
    get UUID() {
        //@native => ""
        return Properties.of(this).serviceUUID;
    }
    /**
     * 蓝牙服务是否已被发现,被发现的蓝牙服务才可以继续扫描特征值，蓝牙断开时，isDiscovered为false
     * @member
     * @type {boolean}
     * @readonly
     *
     */
    get isDiscovered() {
        //@native => false
        return Properties.of(this).isDiscovered;
    }
    /**
     * 发现蓝牙特征，此方法返回true or false，表示是否开始发现蓝牙特征值。发现的蓝牙特征值需要通过订阅BluetoothEvent的bluetoothCharacteristicDiscovered来使用
     * @method
     * @param {...string} characteristicUUIDs -特征的 UUID
     * @returns {boolean}
     *
     */
    startDiscoverCharacteristics(...characteristicUUIDs) {
        //@native :=> false
        //@mark andr done
        //@mark iOS done
        if (!this.isDiscovered) {
            return false;
        }
        const notFound = characteristicUUIDs;//.filter(uuid => !this.getCharacteristic(uuid).isDiscovered)
        const self = Properties.of(this);
        const { fakemac, serviceUUID, characteristicUUID } = self;
        native.MIOTBluetooth.discoverCharacteristics(fakemac.id, notFound, serviceUUID);
        return true;
        //@native end
    }
    /**
     * 获取蓝牙特征值，如果没有，会创建一个，然后保存到缓存中，注意新创建的并不能直接使用，需要被发现后才可真正使用
     * @member
     * @param {string} characteristicUUID
     * @returns {IBluetoothCharacteristic}
     *
     */
    getCharacteristic(characteristicUUID) {
        //@native :=> null
        //@mark andr done
        const fullUUID = getBluetoothUUID128(characteristicUUID);
        if (!fullUUID) {
            return null;
        }
        const { characteristics, fakemac } = Properties.of(this);
        let character = characteristics.get(fullUUID);
        if (!character) {
            character = new IBluetoothCharacteristic();
            Properties.init(character, { fakemac, serviceUUID: this.UUID, characteristicUUID, fullUUID })
            characteristics.set(fullUUID, character)
        }
        return character;
        //@native end
    }
}