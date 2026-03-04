export const getScoreCategory = (score) => {
  if (score >= 750) return { category: 'Excellent', color: 'emerald', gradient: 'score-gradient-excellent' }
  if (score >= 700) return { category: 'Good', color: 'blue', gradient: 'score-gradient-good' }
  if (score >= 650) return { category: 'Fair', color: 'amber', gradient: 'score-gradient-fair' }
  if (score >= 600) return { category: 'Poor', color: 'orange', gradient: 'score-gradient-poor' }
  return { category: 'Very Poor', color: 'red', gradient: 'score-gradient-very-poor' }
}

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
