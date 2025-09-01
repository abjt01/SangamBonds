/**
 * SangamBonds Price Calculator
 * Calculates various bond pricing metrics and yields
 */

class PriceCalculator {
    
    /**
     * Calculate Present Value of a bond
     * @param {number} faceValue - Face value of the bond
     * @param {number} couponRate - Annual coupon rate (as percentage)
     * @param {number} marketRate - Market discount rate (as percentage)
     * @param {number} yearsToMaturity - Years to maturity
     * @param {number} paymentFrequency - Payments per year (default: 2 for semi-annual)
     * @returns {number} Present value of the bond
     */
    calculatePresentValue(faceValue, couponRate, marketRate, yearsToMaturity, paymentFrequency = 2) {
        const periodicCoupon = (faceValue * couponRate / 100) / paymentFrequency;
        const periodicRate = marketRate / 100 / paymentFrequency;
        const totalPeriods = yearsToMaturity * paymentFrequency;
        
        let pv = 0;
        
        // Present value of coupon payments
        for (let i = 1; i <= totalPeriods; i++) {
            pv += periodicCoupon / Math.pow(1 + periodicRate, i);
        }
        
        // Present value of face value
        pv += faceValue / Math.pow(1 + periodicRate, totalPeriods);
        
        return Math.round(pv * 100) / 100;
    }
    
    /**
     * Calculate Yield to Maturity (YTM)
     * @param {number} currentPrice - Current market price
     * @param {number} faceValue - Face value of the bond
     * @param {number} couponRate - Annual coupon rate (as percentage)
     * @param {number} yearsToMaturity - Years to maturity
     * @param {number} paymentFrequency - Payments per year (default: 2)
     * @returns {number} Yield to Maturity (as percentage)
     */
    calculateYTM(currentPrice, faceValue, couponRate, yearsToMaturity, paymentFrequency = 2) {
        // Simplified YTM calculation using approximation
        const annualCoupon = faceValue * (couponRate / 100);
        
        // YTM approximation formula
        const ytm = (annualCoupon + (faceValue - currentPrice) / yearsToMaturity) /
                   ((faceValue + currentPrice) / 2) * 100;
        
        return Math.round(ytm * 100) / 100;
    }
    
    /**
     * Calculate Current Yield
     * @param {number} annualCoupon - Annual coupon payment
     * @param {number} currentPrice - Current market price
     * @returns {number} Current yield (as percentage)
     */
    calculateCurrentYield(annualCoupon, currentPrice) {
        return Math.round((annualCoupon / currentPrice) * 100 * 100) / 100;
    }
    
    /**
     * Calculate Modified Duration
     * @param {number} ytm - Yield to Maturity (as decimal)
     * @param {number} duration - Macaulay Duration
     * @param {number} paymentFrequency - Payments per year
     * @returns {number} Modified Duration
     */
    calculateModifiedDuration(ytm, duration, paymentFrequency = 2) {
        const periodicYTM = ytm / paymentFrequency;
        return duration / (1 + periodicYTM);
    }
    
    /**
     * Calculate Macaulay Duration
     * @param {Object} bondParams - Bond parameters
     * @returns {number} Macaulay Duration in years
     */
    calculateMacaulayDuration(bondParams) {
        const { currentPrice, faceValue, couponRate, yearsToMaturity, paymentFrequency = 2 } = bondParams;
        const periodicCoupon = (faceValue * couponRate / 100) / paymentFrequency;
        const totalPeriods = yearsToMaturity * paymentFrequency;
        const ytm = this.calculateYTM(currentPrice, faceValue, couponRate, yearsToMaturity, paymentFrequency) / 100;
        const periodicYTM = ytm / paymentFrequency;
        
        let weightedTimeSum = 0;
        
        // Calculate weighted time for coupon payments
        for (let i = 1; i <= totalPeriods; i++) {
            const pv = periodicCoupon / Math.pow(1 + periodicYTM, i);
            const weight = pv / currentPrice;
            const timeInYears = i / paymentFrequency;
            weightedTimeSum += weight * timeInYears;
        }
        
        // Add weighted time for face value
        const pvFaceValue = faceValue / Math.pow(1 + periodicYTM, totalPeriods);
        const faceValueWeight = pvFaceValue / currentPrice;
        weightedTimeSum += faceValueWeight * yearsToMaturity;
        
        return Math.round(weightedTimeSum * 100) / 100;
    }
    
    /**
     * Calculate Convexity
     * @param {Object} bondParams - Bond parameters
     * @returns {number} Convexity
     */
    calculateConvexity(bondParams) {
        const { currentPrice, faceValue, couponRate, yearsToMaturity, paymentFrequency = 2 } = bondParams;
        const periodicCoupon = (faceValue * couponRate / 100) / paymentFrequency;
        const totalPeriods = yearsToMaturity * paymentFrequency;
        const ytm = this.calculateYTM(currentPrice, faceValue, couponRate, yearsToMaturity, paymentFrequency) / 100;
        const periodicYTM = ytm / paymentFrequency;
        
        let convexity = 0;
        
        // Calculate convexity for coupon payments
        for (let i = 1; i <= totalPeriods; i++) {
            const pv = periodicCoupon / Math.pow(1 + periodicYTM, i);
            convexity += (pv * i * (i + 1)) / Math.pow(1 + periodicYTM, 2);
        }
        
        // Add convexity for face value
        const pvFaceValue = faceValue / Math.pow(1 + periodicYTM, totalPeriods);
        convexity += (pvFaceValue * totalPeriods * (totalPeriods + 1)) / Math.pow(1 + periodicYTM, 2);
        
        convexity = convexity / (currentPrice * Math.pow(paymentFrequency, 2));
        
        return Math.round(convexity * 10000) / 10000;
    }
    
    /**
     * Calculate Accrued Interest
     * @param {number} faceValue - Face value of the bond
     * @param {number} couponRate - Annual coupon rate (as percentage)
     * @param {Date} lastCouponDate - Last coupon payment date
     * @param {Date} settlementDate - Settlement date
     * @param {number} paymentFrequency - Payments per year
     * @returns {number} Accrued interest
     */
    calculateAccruedInterest(faceValue, couponRate, lastCouponDate, settlementDate, paymentFrequency = 2) {
        const daysBetweenCoupons = 365 / paymentFrequency;
        const daysSinceLastCoupon = Math.floor((settlementDate - lastCouponDate) / (1000 * 60 * 60 * 24));
        const periodicCoupon = (faceValue * couponRate / 100) / paymentFrequency;
        
        return Math.round((periodicCoupon * daysSinceLastCoupon / daysBetweenCoupons) * 100) / 100;
    }
    
    /**
     * Calculate Credit Spread
     * @param {number} bondYTM - Bond's Yield to Maturity
     * @param {number} riskFreeRate - Risk-free rate (government bond yield)
     * @returns {number} Credit spread in basis points
     */
    calculateCreditSpread(bondYTM, riskFreeRate) {
        return Math.round((bondYTM - riskFreeRate) * 10000) / 100; // Convert to basis points
    }
    
    /**
     * Calculate Option Adjusted Spread (simplified)
     * @param {number} bondPrice - Current bond price
     * @param {number} riskFreePrice - Price without credit risk
     * @returns {number} Option Adjusted Spread approximation
     */
    calculateOAS(bondPrice, riskFreePrice) {
        return Math.round(((riskFreePrice - bondPrice) / bondPrice) * 10000) / 100;
    }
    
    /**
     * Calculate Price Sensitivity to Interest Rate Changes
     * @param {Object} bondParams - Bond parameters
     * @param {number} rateChange - Interest rate change (as decimal, e.g., 0.01 for 1%)
     * @returns {Object} Price sensitivity analysis
     */
    calculatePriceSensitivity(bondParams, rateChange = 0.01) {
        const { currentPrice, faceValue, couponRate, yearsToMaturity, paymentFrequency = 2 } = bondParams;
        const currentYTM = this.calculateYTM(currentPrice, faceValue, couponRate, yearsToMaturity, paymentFrequency) / 100;
        
        const newYTM = currentYTM + rateChange;
        const newPrice = this.calculatePresentValue(faceValue, couponRate, newYTM * 100, yearsToMaturity, paymentFrequency);
        
        const priceChange = newPrice - currentPrice;
        const percentageChange = (priceChange / currentPrice) * 100;
        
        return {
            currentPrice: Math.round(currentPrice * 100) / 100,
            newPrice: Math.round(newPrice * 100) / 100,
            priceChange: Math.round(priceChange * 100) / 100,
            percentageChange: Math.round(percentageChange * 100) / 100,
            rateChange: rateChange * 100
        };
    }
    
    /**
     * Get comprehensive bond analytics
     * @param {Object} bondData - Complete bond data
     * @returns {Object} Comprehensive analytics
     */
    getComprehensiveAnalytics(bondData) {
        const { currentPrice, faceValue, couponRate, maturity, paymentFrequency = 2 } = bondData;
        const yearsToMaturity = (new Date(maturity) - new Date()) / (1000 * 60 * 60 * 24 * 365);
        
        const annualCoupon = faceValue * (couponRate / 100);
        const ytm = this.calculateYTM(currentPrice, faceValue, couponRate, yearsToMaturity, paymentFrequency);
        const currentYield = this.calculateCurrentYield(annualCoupon, currentPrice);
        const macaulayDuration = this.calculateMacaulayDuration({
            currentPrice, faceValue, couponRate, yearsToMaturity, paymentFrequency
        });
        const modifiedDuration = this.calculateModifiedDuration(ytm / 100, macaulayDuration, paymentFrequency);
        const convexity = this.calculateConvexity({
            currentPrice, faceValue, couponRate, yearsToMaturity, paymentFrequency
        });
        
        // Price sensitivity scenarios
        const sensitivity = {
            '1%_increase': this.calculatePriceSensitivity(
                { currentPrice, faceValue, couponRate, yearsToMaturity, paymentFrequency }, 0.01
            ),
            '1%_decrease': this.calculatePriceSensitivity(
                { currentPrice, faceValue, couponRate, yearsToMaturity, paymentFrequency }, -0.01
            )
        };
        
        return {
            bondId: bondData.bondId || bondData._id,
            bondName: bondData.name,
            currentPrice: Math.round(currentPrice * 100) / 100,
            faceValue,
            couponRate,
            yearsToMaturity: Math.round(yearsToMaturity * 100) / 100,
            analytics: {
                ytm: Math.round(ytm * 100) / 100,
                currentYield: Math.round(currentYield * 100) / 100,
                macaulayDuration: Math.round(macaulayDuration * 100) / 100,
                modifiedDuration: Math.round(modifiedDuration * 100) / 100,
                convexity: Math.round(convexity * 10000) / 10000
            },
            sensitivity,
            riskMetrics: {
                priceVolatility: Math.abs(sensitivity['1%_increase'].percentageChange),
                interestRateRisk: modifiedDuration > 5 ? 'High' : modifiedDuration > 2 ? 'Medium' : 'Low'
            },
            investmentGrade: this.determineInvestmentGrade(bondData.rating),
            calculatedAt: new Date()
        };
    }
    
    /**
     * Determine investment grade based on rating
     * @param {string} rating - Credit rating
     * @returns {string} Investment grade classification
     */
    determineInvestmentGrade(rating) {
        const investmentGradeRatings = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-'];
        return investmentGradeRatings.includes(rating) ? 'Investment Grade' : 'Speculative Grade';
    }
    
    /**
     * Calculate fair value using dividend discount model approach
     * @param {Object} bondParams - Bond parameters
     * @param {number} requiredReturn - Required rate of return
     * @returns {number} Fair value estimate
     */
    calculateFairValue(bondParams, requiredReturn) {
        const { faceValue, couponRate, yearsToMaturity, paymentFrequency = 2 } = bondParams;
        return this.calculatePresentValue(faceValue, couponRate, requiredReturn, yearsToMaturity, paymentFrequency);
    }
    
    /**
     * Calculate break-even yield
     * @param {number} purchasePrice - Purchase price of the bond
     * @param {Object} bondParams - Bond parameters
     * @returns {number} Break-even yield
     */
    calculateBreakEvenYield(purchasePrice, bondParams) {
        const { faceValue, couponRate, yearsToMaturity, paymentFrequency = 2 } = bondParams;
        return this.calculateYTM(purchasePrice, faceValue, couponRate, yearsToMaturity, paymentFrequency);
    }
}

// Export singleton instance
module.exports = new PriceCalculator();