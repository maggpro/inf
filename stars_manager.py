from telegram import InlineKeyboardButton, InlineKeyboardMarkup, LabeledPrice
from typing import Dict, Optional, List
from dataclasses import dataclass
from functools import lru_cache

@dataclass
class StarsPackage:
    stars: int
    bonus: int
    description: str

class StarsManager:
    # Константы для пакетов Stars
    PACKAGES: Dict[int, StarsPackage] = {
        5: StarsPackage(5, 0, "Начальный пакет"),
        10: StarsPackage(10, 1, "Малый пакет"),
        100: StarsPackage(100, 20, "Средний пакет"),
        500: StarsPackage(500, 100, "Большой пакет"),
        1000: StarsPackage(1000, 200, "Премиум пакет"),
        5000: StarsPackage(5000, 1000, "VIP пакет"),
        10000: StarsPackage(10000, 2000, "Элитный пакет"),
        50000: StarsPackage(50000, 10000, "Легендарный пакет")
    }

    @staticmethod
    @lru_cache(maxsize=1)
    def get_stars_packages_keyboard() -> InlineKeyboardMarkup:
        """Кэшированная клавиатура с пакетами Stars"""
        keyboard = [
            [InlineKeyboardButton(
                f"💫 {amount} Stars {f'+ {package.bonus} бонус' if package.bonus else ''}",
                callback_data=f'buy_stars_{amount}'
            )]
            for amount, package in StarsManager.PACKAGES.items()
        ]
        keyboard.append([InlineKeyboardButton("◀️ Назад", callback_data='back_to_main')])
        return InlineKeyboardMarkup(keyboard)

    @staticmethod
    def get_stars_package_info(amount: int) -> Optional[StarsPackage]:
        """Получить информацию о пакете Stars"""
        return StarsManager.PACKAGES.get(amount)

    @staticmethod
    def get_payment_invoice(amount: int) -> Optional[Dict]:
        """Создать инвойс для покупки Stars"""
        package = StarsManager.get_stars_package_info(amount)
        if not package:
            return None

        total_stars = package.stars + package.bonus
        return {
            'title': f'Покупка {amount} Stars',
            'description': (
                f'💫 {package.stars} Stars\n'
                f'🎁 Бонус: +{package.bonus} Stars\n'
                f'📊 Всего: {total_stars} Stars'
            ),
            'payload': f'stars_{amount}',
            'currency': 'XTR',
            'prices': [LabeledPrice(label=f'{amount} Stars', amount=amount)],
            'provider_token': None,
            'need_name': False,
            'send_email_to_provider': False,
            'send_phone_number_to_provider': False,
            'is_flexible': False,
            'max_tip_amount': 0,
            'suggested_tip_amounts': []
        }

    @staticmethod
    def format_stars_message() -> str:
        """Форматировать сообщение о покупке Stars"""
        return (
            "💫 Пополнение Stars:\n\n"
            "🔸 Чем больше Stars покупаете, тем больше бонус!\n"
            "🔸 Stars можно потратить на:\n"
            "  - Покупку еды для котика\n"
            "  - Игрушки и развлечения\n"
            "  - Особые предметы\n"
            "  - Улучшение характеристик\n\n"
            "Выберите сумму пополнения:"
        )

    @staticmethod
    def process_stars_purchase(amount):
        """Обработка покупки Stars"""
        package = StarsManager.get_stars_package_info(amount)
        if not package:
            return "Неверная сумма!"

        return (
            f"💫 Покупка {amount} Stars\n"
            f"💰 Стоимость: {package['price']}₽\n"
            f"🎁 Бонус: +{package['bonus']} Stars\n\n"
            f"Всего: {amount + package['bonus']} Stars"
        )