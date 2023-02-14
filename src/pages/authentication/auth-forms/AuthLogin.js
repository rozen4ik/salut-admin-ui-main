import React from 'react';

import { Button, FormHelperText, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, Stack } from '@mui/material';

import * as Yup from 'yup';
import { Formik } from 'formik';
import AnimateButton from 'components/@extended/AnimateButton';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import controller from '../../../api/controller';

const AuthLogin = () => {
    const navigation = useNavigate();

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    return (
        <>
            <Formik
                initialValues={{
                    identifier: '0',
                    submit: null
                }}
                validationSchema={Yup.object().shape({
                    identifier: Yup.string().required('Введите идентификатор!')
                })}
                onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                    try {
                        controller.login(values.identifier).then((res) => {
                            if (res.message) {
                                setStatus({ success: false });
                                setErrors({ submit: res.message });
                                setSubmitting(false);
                            } else {
                                localStorage.setItem('identifier', values.identifier);
                                localStorage.setItem('user', JSON.stringify(res));
                            }
                            navigation('/', { replace: true });
                        });
                    } catch (err) {
                        setStatus({ success: false });
                        setErrors({ submit: err.message });
                        setSubmitting(false);
                    }
                }}
            >
                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                    <form noValidate onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="login">Логин</InputLabel>
                                    <OutlinedInput
                                        id="identifier"
                                        type="text"
                                        value={values.login}
                                        name="identifier"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        placeholder="Идентификатор"
                                        fullWidth
                                        error={Boolean(touched.identifier && errors.identifier)}
                                    />
                                    {touched.identifier && errors.identifier && (
                                        <FormHelperText error id="standard-weight-helper-text-email-login">
                                            {errors.identifier}
                                        </FormHelperText>
                                    )}
                                </Stack>
                            </Grid>
                            {errors.submit && (
                                <Grid item xs={12}>
                                    <FormHelperText error>{errors.submit}</FormHelperText>
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                <AnimateButton>
                                    <Button
                                        disableElevation
                                        disabled={isSubmitting}
                                        fullWidth
                                        size="large"
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                    >
                                        Войти
                                    </Button>
                                </AnimateButton>
                            </Grid>
                        </Grid>
                    </form>
                )}
            </Formik>
        </>
    );
};

export default AuthLogin;
