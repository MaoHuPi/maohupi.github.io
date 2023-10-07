(;
 ; 2023 © MaoHuPi
 ; OCR資料處理部分
 ; c0CodeOCR > script > ocr.wat
 ;)
(module
	(import "console" "log" (func $console.log (param i32)))

	(memory $imageData 1 100)
	(global $trashCan (mut i32) (i32.const 0))
	(global $pageSize i32 (i32.const 65536))
	(func $reserveMemory
		(param $dataLength i32)

		(memory.grow
			(i32.add
				(i32.div_u
					(local.get $dataLength)
					(global.get $pageSize)
				)
				(i32.const 1)
			)
		)
		(global.set $trashCan)
	)
	(func $rgba2gray
		(param $dataPtr i32)
		(param $width i32)
		(param $height i32)
		(result i32)
		(local $dataLength i32)
		(local $pixelPtr i32)
		(local $resultLength i32)

		(local.set $dataLength (i32.load (local.get $dataPtr)))
		(local.set $dataPtr (i32.add (local.get $dataPtr) (i32.const 4)))
		(local.set $pixelPtr (local.get $dataPtr))
		(loop $r2g_eachPixel
			(i32.store8
				(i32.add (local.get $dataPtr) (local.get $resultLength))
				(i32.add
					(i32.div_u
						(i32.mul
							(i32.div_u
								(i32.add
									(i32.load8_u (local.get $pixelPtr))
									(i32.add
										(i32.load8_u (i32.add (local.get $pixelPtr) (i32.const 1)))
										(i32.load8_u (i32.add (local.get $pixelPtr) (i32.const 2)))
									)
								)
								(i32.const 3)
							)
							(i32.load8_u (i32.add (local.get $pixelPtr) (i32.const 3)))
						)
						(i32.const 255)
					)
					(i32.sub
						(i32.const 255)
						(i32.load8_u (i32.add (local.get $pixelPtr) (i32.const 3)))
					)
				)
			)
			(local.set $resultLength (i32.add (local.get $resultLength) (i32.const 1)))
			(local.set $pixelPtr (i32.add (local.get $pixelPtr) (i32.const 4)))
			(br_if $r2g_eachPixel (i32.lt_u (local.get $pixelPtr) (i32.add (local.get $dataPtr) (local.get $dataLength))))
		)
		(local.set $dataPtr (i32.sub (local.get $dataPtr) (i32.const 4)))
		(i32.store (local.get $dataPtr) (local.get $resultLength))
		(local.get $dataPtr)
	)
	(func $cutImage
		(param $dataPtr i32)
		(param $width i32)
		(param $height i32)
		(param $cX i32)
		(param $cY i32)
		(param $cW i32)
		(param $cH i32)
		(param $channelAmount i32)
		(result i32)
		(local $wi i32)
		(local $hi i32)
		(local $ci i32)
		(local $pixelPtr i32)
		(local $dataLength i32) (local $resultPtr i32) (local $resultLength i32)

		(local.set $dataLength (i32.load (local.get $dataPtr)))
		(local.set $dataPtr (i32.add (local.get $dataPtr) (i32.const 4)))
		(local.set $resultPtr (i32.add (i32.add (local.get $dataPtr) (local.get $dataLength)) (i32.const 4)))
		(local.set $resultLength (i32.const 0))
		(local.set $wi (i32.const 0))
		(local.set $hi (i32.const 0))
		(loop $cI_eachPixel
			(local.set $pixelPtr
				(i32.add
					(local.get $dataPtr)
					(i32.mul
						(i32.add
							(i32.mul
								(i32.add (local.get $cY) (local.get $hi))
								(local.get $width)
							)
							(i32.add (local.get $cX) (local.get $wi))
						)
						(local.get $channelAmount)
					)
				)
			)
			(local.set $ci (i32.const 0))
			(loop $cI_forCi
				(i32.store8
					(i32.add (local.get $resultPtr) (local.get $resultLength))
					(i32.load8_u (i32.add (local.get $pixelPtr) (local.get $ci))))
				(local.set $ci (i32.add (local.get $ci) (i32.const 1)))
				(local.set $resultLength (i32.add (local.get $resultLength) (i32.const 1)))
				(br_if $cI_forCi (i32.lt_u (local.get $ci) (local.get $channelAmount)))
			)
			(local.set $wi (i32.add (local.get $wi) (i32.const 1)))
			(if (i32.eq (local.get $wi) (local.get $cW))
				(then
					(local.set $hi (i32.add (local.get $hi) (i32.const 1)))
					(local.set $wi (i32.const 0))
				)
			)
			(br_if $cI_eachPixel (i32.and
				(i32.lt_u (local.get $wi) (local.get $cW))
				(i32.lt_u (local.get $hi) (local.get $cH))
			))
		)
		(local.set $resultPtr (i32.sub (local.get $resultPtr) (i32.const 4)))
		(i32.store (local.get $resultPtr) (local.get $resultLength))
		(local.get $resultPtr)
	)
	(func $stretchImage
		(param $dataPtr i32)
		(param $width i32)
		(param $height i32)
		(param $tW i32)
		(param $tH i32)
		(param $channelAmount i32)
		(result i32)
		(local $wi i32) (local $wRate f32) (local $wr f32)
		(local $hi i32) (local $hRate f32) (local $hr f32)
		(local $ci i32)
		(local $00Ptr i32) (local $01Ptr i32) (local $10Ptr i32) (local $11Ptr i32)
		(local $dataLength i32) (local $resultPtr i32) (local $resultLength i32)

		(local.set $dataLength (i32.load (local.get $dataPtr)))
		(local.set $dataPtr (i32.add (local.get $dataPtr) (i32.const 4)))
		(local.set $resultPtr (i32.add (i32.add (local.get $dataPtr) (local.get $dataLength)) (i32.const 4)))
		(local.set $resultLength (i32.const 0))
		(local.set $wi (i32.const 0))
		(local.set $hi (i32.const 0))
		(local.set $wRate
			(f32.div
				(f32.convert_i32_u (i32.sub (local.get $width) (i32.const 1)))
				(f32.convert_i32_u (i32.sub (local.get $tW) (i32.const 1)))))
		(local.set $hRate
			(f32.div
				(f32.convert_i32_u (i32.sub (local.get $height) (i32.const 1)))
				(f32.convert_i32_u (i32.sub (local.get $tH) (i32.const 1)))))
		(loop $sI_forWiHi
			(local.set $wr (f32.mul (f32.convert_i32_u (local.get $wi)) (local.get $wRate)))
			(local.set $hr (f32.mul (f32.convert_i32_u (local.get $hi)) (local.get $hRate)))
			(local.set $00Ptr
				(i32.add
					(local.get $dataPtr)
					(i32.mul
						(i32.add (i32.trunc_f32_u (local.get $wr)) (i32.mul (i32.trunc_f32_u (local.get $hr)) (local.get $width)))
						(local.get $channelAmount))))
			(local.set $01Ptr
				(i32.add
					(local.get $dataPtr)
					(i32.mul
						(i32.add (i32.trunc_f32_u (local.get $wr)) (i32.mul (i32.trunc_f32_u (f32.ceil (local.get $hr))) (local.get $width)))
						(local.get $channelAmount))))
			(local.set $10Ptr
				(i32.add
					(local.get $dataPtr)
					(i32.mul
						(i32.add (i32.trunc_f32_u (f32.ceil (local.get $wr))) (i32.mul (i32.trunc_f32_u (local.get $hr)) (local.get $width)))
						(local.get $channelAmount))))
			(local.set $11Ptr
				(i32.add
					(local.get $dataPtr)
					(i32.mul
						(i32.add (i32.trunc_f32_u (f32.ceil (local.get $wr))) (i32.mul (i32.trunc_f32_u (f32.ceil (local.get $hr))) (local.get $width)))
						(local.get $channelAmount))))
			(local.set $ci (i32.const 0))
			(local.set $wr (f32.sub (local.get $wr) (f32.floor (local.get $wr))))
			(local.set $hr (f32.sub (local.get $hr) (f32.floor (local.get $hr))))
			(loop $sI_forCi
				(i32.store8
					(i32.add (local.get $resultPtr) (local.get $resultLength))
					(i32.trunc_f32_u
						(f32.add
							(f32.add
								(f32.mul
									(f32.convert_i32_u (i32.load8_u (i32.add (local.get $00Ptr) (local.get $ci))))
									(f32.mul
										(f32.sub (f32.const 1) (local.get $wr))
										(f32.sub (f32.const 1) (local.get $hr))))
								(f32.mul
									(f32.convert_i32_u (i32.load8_u (i32.add (local.get $01Ptr) (local.get $ci))))
									(f32.mul
										(f32.sub (f32.const 1) (local.get $wr))
										(local.get $hr))))
							(f32.add
								(f32.mul
									(f32.convert_i32_u (i32.load8_u (i32.add (local.get $10Ptr) (local.get $ci))))
									(f32.mul
										(local.get $wr)
										(f32.sub (f32.const 1) (local.get $hr))))
								(f32.mul
									(f32.convert_i32_u (i32.load8_u (i32.add (local.get $11Ptr) (local.get $ci))))
									(f32.mul
										(local.get $wr)
										(local.get $hr)))))))
				(local.set $ci (i32.add (local.get $ci) (i32.const 1)))
				(local.set $resultLength (i32.add (local.get $resultLength) (i32.const 1)))
				(br_if $sI_forCi (i32.lt_u (local.get $ci) (local.get $channelAmount)))
			)
			(local.set $wi (i32.add (local.get $wi) (i32.const 1)))
			(if (i32.eq (local.get $wi) (local.get $tW))
				(then
					(local.set $hi (i32.add (local.get $hi) (i32.const 1)))
					(local.set $wi (i32.const 0))
				)
			)
			(br_if $sI_forWiHi (i32.and
				(i32.lt_u (local.get $wi) (local.get $tW))
				(i32.lt_u (local.get $hi) (local.get $tH))
			))
		)
		(local.set $resultPtr (i32.sub (local.get $resultPtr) (i32.const 4)))
		(i32.store (local.get $resultPtr) (local.get $resultLength))
		(local.get $resultPtr)
	)
	(func $getDifferentPointsX
		(param $dataPtr i32)
		(param $width i32)
		(param $height i32)
		(param $channelAmount i32)
		(result i32)
		(local $dataLength i32)
		(local $pixelPtr i32)
		(local $row i32)
		(local $column i32)
		(local $ci i32)
		(local $emptyFlag i32)
		(local $lastRowEmpty i32)
		(local $resultLength i32)
		(local $resultPtr i32)

		(local.set $dataLength (i32.load (local.get $dataPtr)))
		(local.set $dataPtr (i32.add (local.get $dataPtr) (i32.const 4)))
		(local.set $resultPtr (i32.add (i32.add (local.get $dataPtr) (local.get $dataLength)) (i32.const 4)))
		(local.set $resultLength (i32.const 0))
		(local.set $lastRowEmpty (i32.const 1))
		(local.set $row (i32.const 0))
		(local.set $column (i32.const 0))
		(local.set $emptyFlag (i32.const 1))
		(loop $gDPX_eachPixel
			(local.set $pixelPtr
				(i32.add
					(local.get $dataPtr)
					(i32.mul
						(i32.add
							(i32.mul
								(local.get $row)
								(local.get $width))
							(local.get $column))
						(local.get $channelAmount))))
			(local.set $ci (i32.const 0))
			(loop $gDPX_forCi
				(if
					(i32.le_u
						(i32.load8_u (i32.add (local.get $pixelPtr) (local.get $ci)))
						(i32.const 127))
					(then
						(local.set $emptyFlag (i32.const 0))
					)
				)
				(local.set $ci (i32.add (local.get $ci) (i32.const 1)))
				(br_if $gDPX_forCi (i32.and
					(i32.lt_u (local.get $ci) (local.get $channelAmount))
					(i32.ne (local.get $emptyFlag) (i32.const 0))
				))
			)

			(local.set $row (i32.add (local.get $row) (i32.const 1)))

			(if
				(i32.eq (local.get $row) (local.get $height))
				(then
					(if
						(i32.ne
							(local.get $lastRowEmpty)
							(i32.eq (local.get $emptyFlag) (i32.const 1)))
						(then
							(local.set $lastRowEmpty (i32.eq (local.get $emptyFlag) (i32.const 1)))
							
							(i32.store8 (i32.add (local.get $resultPtr) (local.get $resultLength))
								(local.get $column))
							(local.set $resultLength (i32.add (local.get $resultLength) (i32.const 1)))
						)
					)
					(local.set $column (i32.add (local.get $column) (i32.const 1)))
					(local.set $row (i32.const 0))
					(local.set $emptyFlag (i32.const 1))))

			(br_if $gDPX_eachPixel
				(i32.and
					(i32.lt_u
						(local.get $row)
						(local.get $height))
					(i32.lt_u
						(local.get $column)
						(local.get $width))))
		)
		(if (i32.eq (i32.rem_u (local.get $resultLength) (i32.const 2)) (i32.const 1))
			(then
				(i32.store8 (i32.add (local.get $resultPtr) (local.get $resultLength))
					(local.get $width))
				(local.set $resultLength (i32.add (local.get $resultLength) (i32.const 1)))
			)
		)
		(local.set $resultPtr (i32.sub (local.get $resultPtr) (i32.const 4)))
		(i32.store (local.get $resultPtr) (local.get $resultLength))
		(local.get $resultPtr)
	)
	(func $getDifferentPointsY
		(param $dataPtr i32)
		(param $width i32)
		(param $height i32)
		(param $channelAmount i32)
		(result i32)
		(local $dataLength i32)
		(local $i i32)
		(local $ci i32)
		(local $emptyFlag i32)
		(local $reletiveX i32)
		(local $lastRowEmpty i32)
		(local $resultLength i32)
		(local $resultPtr i32)

		(local.set $dataLength (i32.load (local.get $dataPtr)))
		(local.set $dataPtr (i32.add (local.get $dataPtr) (i32.const 4)))
		(local.set $resultPtr (i32.add (i32.add (local.get $dataPtr) (local.get $dataLength)) (i32.const 4)))
		(local.set $resultLength (i32.const 0))
		(local.set $lastRowEmpty (i32.const 1))
		(local.set $emptyFlag (i32.const 1))
		(loop $gDPY_eachPixel
			(local.set $ci (i32.const 0))
			(loop $gDPX_forCi
				(if
					(i32.le_u
						(i32.load8_u
							(i32.add
								(local.get $dataPtr)
								(i32.add (local.get $i) (local.get $ci))))
						(i32.const 127))
					(then
						(local.set $emptyFlag (i32.const 0))
					)
				)
				(local.set $ci (i32.add (local.get $ci) (i32.const 1)))
				(br_if $gDPX_forCi (i32.and
					(i32.lt_u (local.get $ci) (local.get $channelAmount))
					(i32.ne (local.get $emptyFlag) (i32.const 0))
				))
			)
			
			(local.set $i (i32.add (local.get $i) (local.get $channelAmount)))
			(local.set $reletiveX (i32.add (local.get $reletiveX) (i32.const 1)))

			(if
				(i32.eq (local.get $reletiveX) (local.get $width))
				(then
					(if
						(i32.ne
							(local.get $lastRowEmpty)
							(i32.eq (local.get $emptyFlag) (i32.const 1)))
						(then
							(local.set $lastRowEmpty (i32.eq (local.get $emptyFlag) (i32.const 1)))
							
							(i32.store8 (i32.add (local.get $resultPtr) (local.get $resultLength))
								(i32.div_u (i32.div_u (i32.sub (local.get $i) (i32.const 1)) (local.get $channelAmount)) (local.get $width)))
							(local.set $resultLength (i32.add (local.get $resultLength) (i32.const 1)))
						)
					)
					(local.set $reletiveX (i32.const 0))
					(local.set $emptyFlag (i32.const 1))))

			(br_if $gDPY_eachPixel
				(i32.lt_u
					(local.get $i)
					(local.get $dataLength)))
		)
		(if (i32.eq (i32.rem_u (local.get $resultLength) (i32.const 2)) (i32.const 1))
			(then
				(i32.store8 (i32.add (local.get $resultPtr) (local.get $resultLength))
					(local.get $height))
				(local.set $resultLength (i32.add (local.get $resultLength) (i32.const 1)))
			)
		)
		(local.set $resultPtr (i32.sub (local.get $resultPtr) (i32.const 4)))
		(i32.store (local.get $resultPtr) (local.get $resultLength))
		(local.get $resultPtr)
	)

	(export "imageData" (memory $imageData))
	(export "reserveMemory" (func $reserveMemory))
	(export "rgba2gray" (func $rgba2gray))
	(export "cutImage" (func $cutImage))
	(export "stretchImage" (func $stretchImage))
	(export "getDifferentPointsX" (func $getDifferentPointsX))
	(export "getDifferentPointsY" (func $getDifferentPointsY))
)