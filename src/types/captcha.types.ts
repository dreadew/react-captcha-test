export interface MarkElement {
	number: number
	location: Array<number>
}

export interface Captcha {
	img: string
	data: Array<CaptchaData>
	icons: Array<string>
}

export interface CaptchaData {
	icon_num: number
	icon_name: string
	x: Array<number>
	y: Array<number>
}
