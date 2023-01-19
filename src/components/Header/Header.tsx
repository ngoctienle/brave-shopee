import { useContext } from 'react'
import { Link, createSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { AppContext } from 'src/contexts/app.context'
import { Schema, schema } from 'src/utils/rules'

import authApi from 'src/apis/auth.api'
import purchaseApi from 'src/apis/purchase.api'
import useQueryConfig from 'src/hooks/useQueryConfig'
import paths from 'src/constants/paths'

import Brand from 'src/components/Brand'
import Popover from 'src/components/Popover'
import { omit } from 'lodash'
import { purchaseStatus } from 'src/constants/purchase'
import { formatCurrency } from 'src/utils/utils'

type FormData = Pick<Schema, 'name'>

const nameSchema = schema.pick(['name'])
const MAX_PRODUCT = 5

export default function Header() {
  const { setIsAuthenticated, isAuthenticated, setUserProfile, userProfile } =
    useContext(AppContext)
  const queryConfig = useQueryConfig()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      name: ''
    },
    resolver: yupResolver(nameSchema)
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.LogoutAccount,
    onSuccess: () => {
      setIsAuthenticated(false)
      setUserProfile(null)
      queryClient.removeQueries({ queryKey: ['purchase', { status: purchaseStatus.inCart }] })
    }
  })

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  const handleSearch = handleSubmit((data) => {
    const config = queryConfig.order
      ? omit(
          {
            ...queryConfig,
            name: data.name
          },
          ['order', 'sort_by']
        )
      : {
          ...queryConfig,
          name: data.name
        }

    navigate({
      pathname: paths.home,
      search: createSearchParams(config).toString()
    })
  })

  const { data: purchaseInCartData } = useQuery({
    queryKey: ['purchase', { status: purchaseStatus.inCart }],
    queryFn: () => purchaseApi.getPurchaseList({ status: purchaseStatus.inCart }),
    enabled: isAuthenticated
  })

  const purchaseListInCart = purchaseInCartData?.data.data

  return (
    <header className='bg-F6F6F6 pb-5 pt-2'>
      <div className='container'>
        <div className='flex items-center justify-end gap-3'>
          {isAuthenticated && (
            <Popover
              className='ml-6 flex cursor-pointer items-center'
              renderPopover={
                <div className='flex flex-col rounded-16 bg-white p-3 shadow-lg'>
                  <Link
                    className='fs-16 rounded-8 py-3 px-6 text-left text-secondary-1A162E transition-colors hover:bg-secondary-F8F8FB/60 hover:text-secondary-77DAE6'
                    to={paths.profile}>
                    Tài khoản của tôi
                  </Link>
                  <Link
                    className='fs-16 rounded-8 py-3 px-6 text-left text-secondary-1A162E transition-colors hover:bg-secondary-F8F8FB/60 hover:text-secondary-77DAE6'
                    to={paths.home}>
                    Đơn mua
                  </Link>
                  <button
                    onClick={handleLogout}
                    className='fs-16 rounded-8 py-3 px-6 text-left text-secondary-1A162E transition-colors hover:bg-secondary-F8F8FB/60 hover:text-secondary-77DAE6'>
                    Đăng xuất
                  </button>
                </div>
              }>
              <div className='mr-1 h-5 w-5 flex-shrink-0'>
                <img
                  src='/assets/icon-profile-light.svg'
                  alt='My Profile'
                  title='My Profile'
                  className='h-full w-full rounded-full object-cover'
                />
              </div>
              <span className='fs-14 text-secondary-1A162E transition-colors hover:text-secondary-1A162E/70'>
                {userProfile?.email}
              </span>
            </Popover>
          )}
          {!isAuthenticated && (
            <div className='flex items-center gap-1'>
              <Link
                to={paths.register}
                className='fs-14 whitespace-nowrap rounded-8 border border-transparent py-[6px] px-2 text-center capitalize text-secondary-1A162E transition-colors hover:text-secondary-1A162E/70'>
                Đăng kí
              </Link>
              {/* <div className='h-4 border-r-[1px] border-r-secondary-1A162E'></div> */}
              <Link
                to={paths.login}
                className='fs-14 whitespace-nowrap rounded-8 border border-secondary-1A162E py-[6px] px-2 text-center capitalize text-secondary-1A162E transition-colors hover:border-secondary-1A162E/70 hover:text-secondary-1A162E/70'>
                Đăng nhập
              </Link>
            </div>
          )}
          <div className='h-4 border-r-[1px] border-r-secondary-1A162E'></div>
          <Popover
            className='flex cursor-pointer items-center'
            renderPopover={
              <div className='flex flex-col rounded-16 bg-white p-3 shadow-lg'>
                <button className='fs-16 rounded-8 py-3 px-6 text-secondary-1A162E transition-colors hover:bg-secondary-F8F8FB/60 hover:text-secondary-77DAE6'>
                  Tiếng Việt
                </button>
                <button className='fs-16 mt-1 rounded-8 py-3 px-6 text-secondary-1A162E transition-colors hover:bg-secondary-F8F8FB/60 hover:text-secondary-77DAE6'>
                  Tiếng Anh
                </button>
              </div>
            }>
            <img
              src='/assets/icon-global-light.svg'
              alt='Support Language'
              title='Support Language'
              width={24}
              height={24}
            />
          </Popover>
        </div>
        <div className='mt-2 grid grid-cols-12'>
          <Link to='/' className='col-span-3 flex max-w-max items-center'>
            <Brand />
          </Link>

          <div className='col-span-9 flex items-center justify-end gap-5'>
            <form
              className='flex h-10 w-[400px] items-center overflow-hidden rounded-8 border border-secondary-EDEDF6 bg-white px-4'
              onSubmit={handleSearch}>
              <input
                type='text'
                placeholder='Free ship đơn từ 0 đồng..'
                className='flex-grow border-none bg-transparent text-secondary-1A162E outline-none placeholder:fs-14 placeholder:text-secondary-1A162E/70'
                {...register('name')}
              />
              <button className='flex-shrink-0 rounded-8'>
                <img
                  src='/assets/icon-search-light.svg'
                  alt='Search Icon'
                  title='Search Icon'
                  width={24}
                  height={24}
                />
              </button>
            </form>
            <Popover
              renderPopover={
                <div className='flex w-[400px] flex-col rounded-16 bg-white p-3 shadow-lg'>
                  <div className='flex items-center justify-between'>
                    <span className='fs-16 font-semibold capitalize text-secondary-1A162E'>
                      Sản phẩm mới thêm
                    </span>
                    <Link
                      to={paths.cart}
                      className='fs-12 cursor-pointer capitalize text-primary-0071DC hover:underline'>
                      xem giỏ hàng
                    </Link>
                  </div>
                  <div className='mt-2 h-[1px] bg-secondary-EDEDF6'></div>
                  {purchaseListInCart
                    ? purchaseListInCart.slice(0, MAX_PRODUCT).map((purchase) => (
                        <div
                          className='mt-2 flex items-center gap-2 rounded-8 p-3 hover:bg-secondary-F8F8FB/60'
                          key={purchase._id}>
                          <img
                            src={purchase.product.image}
                            alt={purchase.product.name}
                            className='h-10 w-10 object-cover'
                          />
                          <div className='flex-grow overflow-hidden'>
                            <p className='fs-16 truncate text-secondary-1A162E'>
                              {purchase.product.name}
                            </p>
                          </div>
                          <div className='flex-shrink-0'>
                            <span className='text-secondary-77DAE6'>
                              {formatCurrency(purchase.product.price)}
                            </span>
                          </div>
                        </div>
                      ))
                    : ''}
                </div>
              }>
              <Link
                to='/'
                className='relative block h-10 w-10 rounded-8 border border-secondary-EDEDF6 bg-white'>
                <img
                  className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                  src='/assets/icon-cart-light.svg'
                  alt='Add To Cart'
                  title='Add To Cart'
                  width={24}
                  height={24}
                />
                {purchaseListInCart && (
                  <span className='fs-9 absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-secondary-77DAE6'>
                    {purchaseListInCart.length}
                  </span>
                )}
              </Link>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  )
}
