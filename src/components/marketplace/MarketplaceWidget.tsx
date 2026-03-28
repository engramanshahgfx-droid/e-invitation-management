'use client'

import { useCart } from '@/contexts/CartContext'
import type { Service } from '@/types/marketplace'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AiOutlineStar, AiOutlineShoppingCart } from 'react-icons/ai'
import { MdAddShoppingCart } from 'react-icons/md'

interface MarketplaceWidgetProps {
  eventId: string
  onCartOpen?: () => void
  maxItems?: number
}

export default function MarketplaceWidget({ eventId, onCartOpen, maxItems = 4 }: MarketplaceWidgetProps) {
  const locale = useLocale()
  const isArabic = locale === 'ar'
  const { addItem, itemCount } = useCart()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingServiceId, setAddingServiceId] = useState<string | null>(null)

  useEffect(() => {
    const loadServices = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch featured/popular services for the event category
        const response = await fetch(
          `/api/marketplace/services?limit=${maxItems}&is_featured=true&sort_by=rating&sort_order=desc`
        )
        if (!response.ok) throw new Error('Failed to fetch services')
        const data = await response.json()
        setServices(data.data?.slice(0, maxItems) || [])
      } catch (err) {
        console.error('Error loading marketplace services:', err)
        setError(isArabic ? 'فشل تحميل الخدمات' : 'Failed to load services')
      } finally {
        setIsLoading(false)
      }
    }

    loadServices()
  }, [eventId, maxItems, isArabic])

  const handleAddToCart = async (service: Service) => {
    setAddingServiceId(service.id)
    try {
      await addItem({
        service_id: service.id,
        quantity: 1,
      })
      // Optionally open cart to show it was added
      if (onCartOpen) {
        setTimeout(onCartOpen, 300)
      }
    } catch (err) {
      console.error('Error adding to cart:', err)
    } finally {
      setAddingServiceId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-transparent p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{isArabic ? 'خدمات إضافية' : 'Optional Services'}</h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (error || services.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-transparent p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {isArabic ? 'خدمات إضافية للحدث' : 'Optional Services for Your Event'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {isArabic
              ? 'أضف خدمات إضافية لتحسين حدثك'
              : 'Enhance your event with optional services'}
          </p>
        </div>
        <button
          onClick={onCartOpen}
          className="relative p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
        >
          <AiOutlineShoppingCart className="h-6 w-6" />
          {itemCount > 0 && (
            <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Service Image */}
            {service.images?.[0]?.url && (
              <div className="relative h-40 w-full overflow-hidden bg-gray-200">
                <img
                  src={service.images[0].url}
                  alt={service.name}
                  className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {service.discount_percentage && service.discount_percentage > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                    -{service.discount_percentage}%
                  </div>
                )}
              </div>
            )}

            {/* Service Info */}
            <div className="p-3 space-y-2">
              <h3 className="font-semibold text-gray-900 line-clamp-2">
                {isArabic && service.name_ar ? service.name_ar : service.name}
              </h3>

              {/* Provider Info */}
              {service.providers && (
                <p className="text-xs text-gray-600">
                  {isArabic && (service.providers as any).business_name_ar
                    ? (service.providers as any).business_name_ar
                    : (service.providers as any).business_name}
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <AiOutlineStar
                      key={i}
                      className="h-3.5 w-3.5"
                      fill={i < Math.floor(service.rating) ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600">
                  ({service.reviews_count})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-lg font-bold text-purple-600">
                  SAR {service.final_price.toFixed(0)}
                </span>
                {service.discount_percentage && service.discount_percentage > 0 && (
                  <span className="text-xs text-gray-500 line-through">
                    SAR {service.price.toFixed(0)}
                  </span>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(service)}
                disabled={addingServiceId === service.id}
                className="w-full mt-3 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200"
              >
                <MdAddShoppingCart className="h-4 w-4" />
                <span className="text-sm">
                  {addingServiceId === service.id
                    ? isArabic
                      ? 'جاري الإضافة...'
                      : 'Adding...'
                    : isArabic
                      ? 'أضف للسلة'
                      : 'Add to Cart'}
                </span>
              </button>

              {/* View Details Link */}
              <Link
                href={`/${locale}/marketplace/${service.id}`}
                className="block text-center text-xs text-purple-600 hover:text-purple-700 font-semibold mt-2"
              >
                {isArabic ? 'عرض التفاصيل' : 'View Details'} →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <Link
        href={`/${locale}/marketplace`}
        className="block text-center mt-6 text-purple-600 hover:text-purple-700 font-semibold text-sm"
      >
        {isArabic ? 'عرض جميع الخدمات' : 'View All Services'} →
      </Link>
    </div>
  )
}
