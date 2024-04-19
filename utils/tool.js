function toFloat(numberString, fixedNum = 2) {
	let num = parseFloat(numberString).toFixed(fixedNum);
	return +num;
}

function showError(title, error = null) {
	if (error) {
		console.error(title, error);
	} else {
		console.log(title);
	}
	wx.showToast({
		title: title,
		icon: "error",
		duration: 3000
	})
}

export {
	toFloat,
	showError
};