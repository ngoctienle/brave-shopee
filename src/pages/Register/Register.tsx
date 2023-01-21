import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { omit } from 'lodash'

import { AppContext } from 'src/contexts/app.context'
import { schema, Schema } from 'src/utils/rules'
import { isAxiosUnprocessableEntityError } from 'src/utils/utils'
import { ErrorRespone } from 'src/types/utils.type'

import authApi from 'src/apis/auth.api'

import Input from 'src/components/Input'
import Button from 'src/components/Button'
import paths from 'src/constants/paths'
import Brand from 'src/components/Brand'

type FormData = Pick<Schema, 'email' | 'password' | 'confirm_password'>
const RegisterSchema = schema.pick(['email', 'password', 'confirm_password'])

export default function Register() {
  const { setIsAuthenticated, setUserProfile } = useContext(AppContext)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(RegisterSchema)
  })

  const registerAccountMutation = useMutation({
    mutationFn: (body: Omit<FormData, 'confirm_password'>) => authApi.RegisterAccount(body)
  })

  const onSubmit = handleSubmit((data) => {
    const body = omit(data, ['confirm_password'])
    registerAccountMutation.mutate(body, {
      onSuccess: (data) => {
        setUserProfile(data.data.data.user)
        setIsAuthenticated(true)
        navigate('/')
      },
      onError: (error) => {
        if (
          isAxiosUnprocessableEntityError<ErrorRespone<Omit<FormData, 'confirm_password'>>>(error)
        ) {
          const formError = error.response?.data.data
          if (formError) {
            Object.keys(formError).forEach((key) => {
              setError(key as keyof Omit<FormData, 'confirm_password'>, {
                message: formError[key as keyof Omit<FormData, 'confirm_password'>],
                type: 'Server'
              })
            })
          }
        }
      }
    })
  })

  return (
    <div className='grid h-screen grid-cols-1 md:grid-cols-12'>
      <div className='bg-FAFAFD md:col-span-6'>
        <div className='flex h-full flex-col items-center justify-center'>
          <img src='/assets/auth-img.svg' alt='' title='' />
          <p className='fs-20 mt-10 max-w-[420px] text-center'>
            The best of luxury brand values, high quality products, and innovative services
          </p>
        </div>
      </div>
      <div className='bg-white md:col-span-6'>
        <div className='flex h-full flex-col items-center justify-around py-[50px]'>
          <Link to='/' className='flex max-w-max items-center'>
            <Brand />
          </Link>
          <form onSubmit={onSubmit} noValidate className='w-[460px]'>
            <h1 className='fs-30 text-center font-bold text-primary-1A162E'>Sign Up</h1>
            <p className='fs-14 mt-[10px] text-center text-secondary-9E9DA8'>
              {' '}
              Let’s create your account and Shop like a pro and save money.
            </p>
            <Input
              className='mt-10'
              type='email'
              name='email'
              placeholder='Email'
              register={register}
              errorMessage={errors.email?.message}
            />
            <Input
              className='mt-1'
              type='password'
              name='password'
              placeholder='Password'
              autoComplete='on'
              register={register}
              errorMessage={errors.password?.message}
            />
            <Input
              className='mt-1'
              type='password'
              name='confirm_password'
              placeholder='Confirm Password'
              autoComplete='on'
              register={register}
              errorMessage={errors.confirm_password?.message}
            />
            <div className='mt-8'>
              <Button
                className='fs-16 flex h-[50px] w-full items-center justify-center rounded-10 bg-primary-FFB700 font-semibold uppercase text-primary-1A162E'
                isLoading={registerAccountMutation.isLoading}
                disabled={registerAccountMutation.isLoading}>
                Đăng Ký
              </Button>
            </div>
          </form>
          <div className='mt-[60px] flex items-center justify-center'>
            <span className='fs-18 text-secondary-9E9DA8'>Bạn đã có tài khoản?</span>
            <Link
              className='fs-18 ml-2 font-semibold capitalize text-primary-0071DC'
              to={paths.login}>
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
