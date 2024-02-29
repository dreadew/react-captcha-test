import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { Captcha, MarkElement } from '../types/captcha.types'

export const CaptchaInput = () => {
	const divElement = useRef<HTMLDivElement>(null)
	const [captcha, setCaptcha] = useState<Captcha>()
	const [marks, setMarks] = useState<Array<MarkElement>>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const getCaptcha = () => {
		setMarks([])
		setIsLoading(true)
		fetch('http://localhost:3030/utils/captcha')
			.then(response => {
				if (!response.ok) {
					throw new Error('error')
				}
				return response.json()
			})
			.then(data => setCaptcha(data))
			.catch((error: any) => {
				console.error('Error: ', error)
			})
		setIsLoading(false)
	}

	const processCaptcha = () => {
		if (marks.length === 0) {
			return alert('вы не выбрали ни 1 элемента')
		}

		if (captcha && marks) {
			if (marks.length < captcha.icons.length) {
				return alert(`выберите еще ${captcha.icons.length - marks.length}`)
			}
		}

		let incorrect = false
		captcha?.data.map((item, idx) => {
			if (
				!(
					marks[idx].location[0] >= item.x[0] &&
					marks[idx].location[0] <= item.x[1] &&
					marks[idx].location[1] >= item.y[0] &&
					marks[idx].location[1] <= item.y[1]
				)
			) {
				incorrect = true
			}
		})

		if (incorrect) {
			setMarks([])
			return alert('Вы не прошли проверку')
		}

		getCaptcha()
		return alert('Вы успешно прошли проверку')
	}

	const handleImageClick = (e: any) => {
		const { pageX, pageY } = e
		const targetRect = e.target.getBoundingClientRect()
		const offsetX = pageX - targetRect.left - 12
		const offsetY = pageY - targetRect.top - 12

		if (captcha && marks) {
			if (marks.length >= captcha.icons.length) {
				return alert('вы уже выбрали максимальное количество элементов')
			}
		}

		setMarks(prevMarks => {
			return [
				...prevMarks,
				{ location: [offsetX, offsetY], number: prevMarks.length + 1 },
			]
		})
	}

	useEffect(() => {
		getCaptcha()
	}, [divElement])

	return (
		<div
			ref={divElement}
			className='flex flex-col gap-3 bg-white p-4 rounded-lg shadow-xl shadow-gray-200'
		>
			<h1 className='font-md font-bold text-gray-900 text-center'>Каптча</h1>
			<div className='flex flex-col gap-2'>
				{captcha?.img && (
					<>
						<div className='relative max-w-4xl flex flex-col gap-3'>
							<div className='bg-gray-100 flex items-center justify-center rounded-lg'>
								<img
									src={`data:image/png;base64, ${captcha?.img}`}
									className='rounded-lg'
									alt='captcha-image'
									onClick={handleImageClick}
								/>
							</div>
							{marks && (
								<>
									{marks.map(mark => (
										<div
											key={mark.number}
											onClick={() =>
												setMarks(marks.filter(mk => mk.number !== mark.number))
											}
											className='absolute rounded-full text-white bg-indigo-600 flex items-center justify-center cursor-pointer w-6 h-6 hover:bg-indigo-700 transition-colors'
											style={{
												left: mark.location[0],
												top: mark.location[1],
											}}
										>
											{mark.number}
										</div>
									))}
								</>
							)}
							<p className='w-[400px] leading-5 flex items-center text-sm text-gray-600 font-regular'>
								Выберите изображения в правильном порядке:
								{captcha.icons.map((item, idx) => (
									<img
										className='ml-2 w-[24px] h-[24px]'
										key={`icon-${idx}`}
										src={`data:image/png;base64, ${item}`}
										alt={`icon-${idx}`}
									/>
								))}
							</p>
						</div>
					</>
				)}
				<div className='flex space-x-2'>
					<button
						className={clsx(
							'text-sm leading-6 font-medium py-2 px-3 rounded-lg border-[1px] transition-colors',
							isLoading
								? 'text-gray-600 border-gray-600 hover:text-gray-500 hover:border-gray-500 opacity-50'
								: 'text-blue-600 border-blue-600 hover:text-blue-700 hover:border-blue-700'
						)}
						onClick={getCaptcha}
						disabled={isLoading}
					>
						Обновить
					</button>
					<button
						className={clsx(
							'flex-grow text-white text-sm leading-6 font-medium py-2 px-3 rounded-lg transition-colors',
							isLoading
								? 'bg-gray-600 hover:bg-gray-500 opacity-50'
								: 'bg-blue-600 hover:bg-blue-700'
						)}
						onClick={processCaptcha}
						disabled={isLoading}
					>
						Проверить
					</button>
				</div>
				<p className='font-regular text-center w-[400px] leading-5 text-xs text-gray-500'>
					Если какие-то иконки не видны, то необходимо нажать на кнопку
					"Обновить"
				</p>
			</div>
		</div>
	)
}
