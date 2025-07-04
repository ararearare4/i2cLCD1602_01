/**
* makecode I2C LCD1602 package for microbit.
* From microbit/micropython Chinese community.
* http://www.micropython.org.cn
*/


let i2cAddr = 0x27 // ← デフォルト値（任意）


/**
 * Custom blocks
 */
//% weight=20 color="#1E90FF" icon="▀"
namespace I2C_LCD1602_KANA {
    //let i2cAddr: number // 0x3F: PCF8574A, 0x27: PCF8574
    let BK: number      // backlight control
    let RS: number      // command/data

    // set LCD reg
    function setreg(d: number) {
        pins.i2cWriteNumber(i2cAddr, d, NumberFormat.Int8LE)
        basic.pause(1)
    }

    // send data to I2C bus
    function set(d: number) {
        d = d & 0xF0
        d = d + BK + RS
        setreg(d)
        setreg(d + 4)
        setreg(d)
    }

    // send command
    function cmd(d: number) {
        RS = 0
        set(d)
        set(d << 4)
    }

    // send data
    function dat(d: number) {
        RS = 1
        set(d)
        set(d << 4)
    }

    // auto get LCD address
    function AutoAddr() {
        let k = true
        let addr = 0x20
        let d1 = 0, d2 = 0
        while (k && (addr < 0x28)) {
            pins.i2cWriteNumber(addr, -1, NumberFormat.Int32LE)
            d1 = pins.i2cReadNumber(addr, NumberFormat.Int8LE) % 16
            pins.i2cWriteNumber(addr, 0, NumberFormat.Int16LE)
            d2 = pins.i2cReadNumber(addr, NumberFormat.Int8LE)
            if ((d1 == 7) && (d2 == 0)) k = false
            else addr += 1
        }
        if (!k) return addr

        addr = 0x38
        while (k && (addr < 0x40)) {
            pins.i2cWriteNumber(addr, -1, NumberFormat.Int32LE)
            d1 = pins.i2cReadNumber(addr, NumberFormat.Int8LE) % 16
            pins.i2cWriteNumber(addr, 0, NumberFormat.Int16LE)
            d2 = pins.i2cReadNumber(addr, NumberFormat.Int8LE)
            if ((d1 == 7) && (d2 == 0)) k = false
            else addr += 1
        }
        if (!k) return addr
        else return 0

    }

    /**
     * initial LCD, set I2C address. Address is 39/63 for PCF8574/PCF8574A
     * @param Addr is i2c address for LCD, eg: 0, 39, 63. 0 is auto find address
     */
    //% blockId="I2C_LCD1620_SET_ADDRESS" block="%addrで初期化"
    //% weight=100 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function LcdInit(Addr: number) {
        if (Addr == 0) i2cAddr = AutoAddr()
        else i2cAddr = Addr
        BK = 8
        RS = 0
        cmd(0x33)       // set 4bit mode
        basic.pause(5)
        set(0x30)
        basic.pause(5)
        set(0x20)
        basic.pause(5)
        cmd(0x28)       // set mode
        cmd(0x0C)
        cmd(0x06)
        cmd(0x01)       // clear
    }

    /**
     * show a number in LCD at given position
     * @param n is number will be show, eg: 10, 100, 200
     * @param x is LCD column position, eg: 0
     * @param y is LCD row position, eg: 0
     */
    //% blockId="I2C_LCD1620_SHOW_NUMBER" block="数字 %n をx %x y %y に表示"
    //% weight=91 blockGap=8
    //% x.min=0 x.max=15
    //% y.min=0 y.max=1
    //% parts=LCD1602_I2C trackArgs=0
    export function ShowNumber(n: number, x: number, y: number): void {
        let s = n.toString()
        ShowString(s, x, y)
    }

    // 濁点・半濁点付き文字を分解
    function normalizeDakuten(c: string): string[] {
        switch (c) {
            case "ガ": return ["カ", "゛"]
            case "ギ": return ["キ", "゛"]
            case "グ": return ["ク", "゛"]
            case "ゲ": return ["ケ", "゛"]
            case "ゴ": return ["コ", "゛"]
            case "ザ": return ["サ", "゛"]
            case "ジ": return ["シ", "゛"]
            case "ズ": return ["ス", "゛"]
            case "ゼ": return ["セ", "゛"]
            case "ゾ": return ["ソ", "゛"]
            case "ダ": return ["タ", "゛"]
            case "ヂ": return ["チ", "゛"]
            case "ヅ": return ["ツ", "゛"]
            case "デ": return ["テ", "゛"]
            case "ド": return ["ト", "゛"]
            case "バ": return ["ハ", "゛"]
            case "ビ": return ["ヒ", "゛"]
            case "ブ": return ["フ", "゛"]
            case "ベ": return ["ヘ", "゛"]
            case "ボ": return ["ホ", "゛"]
            case "パ": return ["ハ", "゜"]
            case "ピ": return ["ヒ", "゜"]
            case "プ": return ["フ", "゜"]
            case "ペ": return ["ヘ", "゜"]
            case "ポ": return ["ホ", "゜"]
            case "ヴ": return ["ウ", "゛"]
            default: return [c]
        }
    }

    // カタカナや記号を LCD コードに変換
    function kanaToLCDCode(c: string): number {
        switch (c) {
            case "ア": return 0xB1
            case "イ": return 0xB2
            case "ウ": return 0xB3
            case "エ": return 0xB4
            case "オ": return 0xB5
            case "カ": return 0xB6
            case "キ": return 0xB7
            case "ク": return 0xB8
            case "ケ": return 0xB9
            case "コ": return 0xBA
            case "サ": return 0xBB
            case "シ": return 0xBC
            case "ス": return 0xBD
            case "セ": return 0xBE
            case "ソ": return 0xBF
            case "タ": return 0xC0
            case "チ": return 0xC1
            case "ツ": return 0xC2
            case "テ": return 0xC3
            case "ト": return 0xC4
            case "ナ": return 0xC5
            case "ニ": return 0xC6
            case "ヌ": return 0xC7
            case "ネ": return 0xC8
            case "ノ": return 0xC9
            case "ハ": return 0xCA
            case "ヒ": return 0xCB
            case "フ": return 0xCC
            case "ヘ": return 0xCD
            case "ホ": return 0xCE
            case "マ": return 0xCF
            case "ミ": return 0xD0
            case "ム": return 0xD1
            case "メ": return 0xD2
            case "モ": return 0xD3
            case "ヤ": return 0xD4
            case "ユ": return 0xD5
            case "ヨ": return 0xD6
            case "ラ": return 0xD7
            case "リ": return 0xD8
            case "ル": return 0xD9
            case "レ": return 0xDA
            case "ロ": return 0xDB
            case "ワ": return 0xDC
            case "ヲ": return 0xA6
            case "ン": return 0xDD
            case "゛": return 0xDE
            case "゜": return 0xDF
            case "ー": return 0xB0
            case "。": return 0xA1
            case "」": return 0xA3
            case "「": return 0xA2
            case "・": return 0xA5
            case "、": return 0xA4
            case "ッ": return 0xAF
            case "ャ": return 0xAC
            case "ュ": return 0xAD
            case "ョ": return 0xAE
            case "ァ": return 0xA7
            case "ィ": return 0xA8
            case "ゥ": return 0xA9
            case "ェ": return 0xAA
            case "ォ": return 0xAB
            default: return c.charCodeAt(0)
        }
    }


    /**
     * show a string in LCD at given position
     * @param s is string will be show, eg: "Hello コンニチハ"
     * @param x is LCD column position, [0 - 15], eg: 0
     * @param y is LCD row position, [0 - 1], eg: 0
     */
    //% blockId="I2C_LCD1620_SHOW_STRING" block="%s を x %x y %y に表示"
    //% weight=90 blockGap=8
    //% x.min=0 x.max=15
    //% y.min=0 y.max=1
    //% parts=LCD1602_I2C trackArgs=0
    export function ShowString(s: string, x: number, y: number): void {
        let a: number

        if (y > 0)
            a = 0xC0
        else
            a = 0x80
        a += x
        cmd(a)

        for (let i = 0; i < s.length; i++) {
            const parts = normalizeDakuten(s.charAt(i))
            for (let j = 0; j < parts.length; j++) {
                const lcdCode = kanaToLCDCode(parts[j])
                dat(lcdCode)
            }
        }
    }

    /**
     * turn on LCD
     */
    //% blockId="I2C_LCD1620_ON" block="オン"
    //% weight=81 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function on(): void {
        cmd(0x0C)
    }

    /**
     * turn off LCD
     */
    //% blockId="I2C_LCD1620_OFF" block="オフ"
    //% weight=80 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function off(): void {
        cmd(0x08)
    }

    /**
     * clear all display content
     */
    //% blockId="I2C_LCD1620_CLEAR" block="表示をクリア"
    //% weight=85 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function clear(): void {
        cmd(0x01)
    }

    /**
     * turn on LCD backlight
     */
    //% blockId="I2C_LCD1620_BACKLIGHT_ON" block="ライトをオン"
    //% weight=71 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function BacklightOn(): void {
        BK = 8
        cmd(0)
    }

    /**
     * turn off LCD backlight
     */
    //% blockId="I2C_LCD1620_BACKLIGHT_OFF" block="ライトをオフ"
    //% weight=70 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function BacklightOff(): void {
        BK = 0
        cmd(0)
    }

    /**
     * shift left
     */
    //% blockId="I2C_LCD1620_SHL" block="左にずらす"
    //% weight=61 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function shl(): void {
        cmd(0x18)
    }

    /**
     * shift right
     */
    //% blockId="I2C_LCD1620_SHR" block="右にずらす"
    //% weight=60 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function shr(): void {
        cmd(0x1C)
    }


    /**
     * 外字スロット0に、棒人間（立ち）を登録
     */
    //% block="外字0に棒人間（立ち）を登録"
    export function initStandingStickman(): void {
        // 1. 通常命令モードに戻す
        writeCommand(0x38)
        basic.pause(2)
    
        // 2. 外字データ定義（棒人間）
        const data = [0x0E, 0x0A, 0x0E, 0x04, 0x1F, 0x04, 0x0A, 0x11]
    
        // 3. CGRAM アドレス設定（slot 0）
        writeCommand(0x40 | (0 << 3))
        basic.pause(2) // ← 重要
    
        // 4. 1バイトずつ書き込み（少しdelayあり）
        for (let b of data) {
            writeData(b)
            basic.pause(1) // ← 重要
        }
    
        // 5. DDRAMに戻す + Display ON
        writeCommand(0x80)
        writeCommand(0x0C)
        basic.pause(2)
    }
    


    /**
     * カーソル位置 x %x, y %y に外字 %slot を表示
     */
    //% block="x %x y %y に外字 %slot を表示"
    //% x.min=0 x.max=15
    //% y.min=0 y.max=1
    //% slot.min=0 slot.max=7
    //% weight=80
    export function printCustomCharAt(x: number, y: number, slot: number): void {
        if (slot < 0 || slot > 7) return;
    
        // 念のため表示ONを再送信（LCDの一部で必要）
        writeCommand(0x0C)
        basic.pause(1)
    
        // カーソル移動
        setCursor(x, y)
        basic.pause(1)
    
        // 外字スロットをデータとして送信
        writeData(slot)
    }



    function setCursor(col: number, row: number): void {
        const rowOffsets = [0x00, 0x40]
        writeCommand(0x80 | (col + rowOffsets[row]))
    }

    function writeCommand(cmd: number): void {
        pins.i2cWriteBuffer(i2cAddr, pins.createBufferFromArray([0x80, cmd]))
    }

    function writeData(data: number): void {
        pins.i2cWriteBuffer(i2cAddr, pins.createBufferFromArray([0x40, data]))
    }



}