import { toFloat } from "../utils/tool";

const baseUrl = "https://forestlamb.online/restaurant/";

// 获取食品列表
function getFoodList(storeId, serviceType, dish_status) {
	// 显示加载提示
	wx.showLoading({
		title: '加载中',
		mask: true
	});
	return new Promise((resolve, reject) => {
		wx.request({
			url: baseUrl + 'dishes/store-dishes/',
			method: 'GET',
			data: {
				storeId: storeId,
				serviceType: serviceType,
				dish_status: dish_status
			},
			success: res => {
				if (res.data.success) {
					// 数据
					let dish_raw = res.data.storeDishes.map(item => item.dish);
					dish_raw.forEach(item => {
						item.price = toFloat(item.price, 2)
					})
					const existingDishIds = new Set(dish_raw.map(item => item.dish_id));

					// 清理
					let categoryMap = new Map();
					dish_raw.forEach(food => {
						let category = categoryMap.get(food.category_id) || {
							title: food.category.category_name,
							list: []
						};
						category.list.push(food);
						categoryMap.set(food.category_id, category);
					});
					// 按销量排序（内）
					let dishes = Array.from(categoryMap.values()).map(category => {
						category.list.sort((a, b) => b.sales - a.sales);
						return category;
					});
					// 按分类id排序（外）
					dishes.sort((a, b) => a.list[0].category_id - b.list[0].category_id).forEach((item, index) => {
						item.id = index;
					});

					// 返回结果
					let data = {
						dishes: dishes,
						existingDishIds: existingDishIds
					};
					resolve(data);
				} else {
					reject("菜品数据请求失败")
				}
			},
			fail: error => {
				reject("菜品数据请求失败", error)
			},
			complete: () => {
				wx.hideLoading();
			}
		});
	})
}


export {
	getFoodList
};