const Voucher = require("../models/voucherSchema");
const { v4: uuidv4 } = require("uuid");


module.exports.generateVouchers = async function (data) {
    try {
        let { amount, limitVoucher, winPrizeRange , minamount} = data;

        let oldWinPrizeRange = winPrizeRange;
        let newWinPrizeRange = winPrizeRange;

        const prizeTable = {
            100: { consolation: [10, 5, 50, 20, 55, 32] },
            500: { consolation: [20, 2, 1, 8, 10, 20, 26] },
            10: { consolation: [8, 10, 20, 26] }
        };

        if (!amount || !limitVoucher || limitVoucher <= 0 || !winPrizeRange || winPrizeRange <= 0)
            throw new Error("Validation failed");

        function randomLessThanExclusive(max) {
            return Math.floor(Math.random() * (max - 1)) + 1;
        }

        function calculateWinAmount(amount, position, winPrizeRange, limitVoucher) {
            const table = prizeTable[amount];
            if (!table) return 0;

            if (position % winPrizeRange === 0) {
                const prizeIndex = randomLessThanExclusive(table.consolation.length);
                return table.consolation[prizeIndex];
            }
            return 0;
        }
    
        function randomWinLessThan(amount, min = 0) {
            const max = amount - 1;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        const vouchers = Array.from({ length: limitVoucher }, (_, index) => {
            const position = index + 1;

            // const result = calculateWinAmount(amount, position, newWinPrizeRange, limitVoucher);
            const result  = randomWinLessThan(newWinPrizeRange, minamount)
            return {
                categoryAmount: amount,
                voucherId: `VCHR-${uuidv4()}`,
                winAmount: result,
                position
            };
        });

        await Voucher.insertMany(vouchers);
    } catch (err) {
        console.log(err);
    }

    return true;
}
