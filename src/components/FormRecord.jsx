import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
  Backdrop,
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import _ from "lodash";
import validator from "validator";
import { makeStyles } from "@material-ui/core/styles";
import moment from "moment";
import React, { memo, useContext, useState } from "react";
import client from "../client";
import { DataContext } from "../App";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

const FormRecord = ({ time, id, onClose, doctor }) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { token, idClinic, setTimes, listClinicAndUrl } = useContext(DataContext);
  const [loading, setLoading] = useState(false);
  const [createdRecord, setCreatedRecord] = useState(null);
  const [errorFio, setErrorFio] = useState(false);
  const [errorPhone, setErrorPhone] = useState(false);
  const [errorCreatedRecord, setErrorCreatedRecord] = useState(false);
  const [payload, setPayload] = useState({
    fio: "",
    phone: "",
    PolicyNumber: "",
    Insurance: "",
    FIOCoordinator: "",
  });

  const messageErrorFIO = () => {
    enqueueSnackbar("Некоректное ФИО", {
      variant: "warning",
      anchorOrigin: {
        vertical: "top",
        horizontal: "center",
      },
    });
  };
  const messageErrorPhone = () => {
    enqueueSnackbar("Некоректный номер  телефон", {
      variant: "warning",
      anchorOrigin: {
        vertical: "top",
        horizontal: "center",
      },
    });
  };
  const messageAcepted = () => {
    enqueueSnackbar("Успешно", {
      variant: "success",
      anchorOrigin: {
        vertical: "top",
        horizontal: "center",
      },
    });
  };
  const messageError = () => {
    enqueueSnackbar("Ошибка", {
      variant: "error",
      anchorOrigin: {
        vertical: "top",
        horizontal: "center",
      },
    });
  };

  const created = () => {
    const rex = RegExp(/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/);
    if (!validator.isMobilePhone(payload.phone, "ru-RU") || rex.test(payload.phone)) {
      setErrorPhone(true);
      messageErrorPhone();
    } else {
      setErrorPhone(false);
    }
    if (!validator.isLength(payload.fio, { min: 5 })) {
      setErrorFio(true);
      messageErrorFIO();
    } else {
      setErrorFio(false);
    }
    if (_.every([validator.isMobilePhone(payload.phone, "ru-RU"), validator.isLength(payload.fio, { min: 5 })])) {
      setLoading(true);
      client
        .setCreatedRecord(payload.fio, time, token, idClinic, id, payload.phone)
        .then((result) => {
          if (result.includes("ErrorCode")) {
            setCreatedRecord(result);
            setErrorCreatedRecord(true);
            messageError();
          } else {
            setCreatedRecord(result);
            setErrorCreatedRecord(false);
            messageAcepted();
          }
        })
        .then(() => setLoading(false))
        .catch(({ message }) => {
          console.error(message);
          setLoading(false);
        });
    }
  };

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      keepMounted
      open={!!time}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="xs"
    >
      {loading ? (
        <Backdrop className={classes.backdrop} open={onClose}>
          <CircularProgress color="inherit" />
        </Backdrop>
      ) : errorCreatedRecord === true && createdRecord !== null && time !== null ? (
        <>
          <DialogTitle id="alert-dialog-title">Произошла ошибка</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">Что-то пошло не так пока мы записывали вас к врачу попробуйте ещё раз...</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              color="primary"
              onClick={() => {
                setTimes({ type: "CHANGE_TIME", id, date: moment(time) });
                onClose();
              }}
            >
              Ок
            </Button>
          </DialogActions>
        </>
      ) : errorCreatedRecord === false && createdRecord !== null && time !== null ? (
        <>
          <DialogTitle id="alert-dialog-title">Вы записались на приём</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <b>Информация о приёме</b>
              <br />
              <b>Кабинет:</b> {doctor}
              <br />
              <b>Время:</b> {moment(time).format("DD:MM:YYYY [В] HH:mm")}
              <br />
              <b>Пациент:</b> {payload.fio}
              <br />
              <b>Телефон пациента:</b> {payload.phone}
              <br />
            </DialogContentText>
            <DialogActions>
              <Button
                autoFocus
                color="primary"
                onClick={() => {
                  setTimes({ type: "CHANGE_TIME", id, date: moment(time) });
                  listClinicAndUrl.forEach((item) => {
                    if (item.IdClinic == idClinic) {
                      window.location = item.url;
                    }
                  });
                  onClose();
                }}
              >
                Ок
              </Button>
            </DialogActions>
          </DialogContent>
        </>
      ) : (
        <>
          <DialogTitle id="alert-dialog-title">Записаться на приём</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <b>Кабинет:</b> {doctor}
              <br />
              <b>Время:</b> {moment(time).format("DD:MM:YYYY [В] HH:mm")}
              <br />
            </DialogContentText>
            <Grid container spacing={1}>
              <Grid item>
                <FormControl error={errorFio} margin={"dense"} required={true} size={"medium"} fullWidth={true}>
                  <InputLabel htmlFor="fio">ФИО</InputLabel>
                  <Input
                    id="fio"
                    aria-describedby="fio-helper-text"
                    value={payload.fio}
                    onChange={({ target: { value } }) => setPayload({ ...payload, fio: value })}
                  />
                  <FormHelperText id="fio-helper-text">Введите ФИО пациента</FormHelperText>
                </FormControl>
                <FormControl id="phone-helper-text" error={errorPhone} margin={"dense"} required={true} size={"medium"} fullWidth={true}>
                  <InputLabel htmlFor="phone">Телефон</InputLabel>
                  <Input value={payload.phone} onChange={({ target: { value } }) => setPayload({ ...payload, phone: value })} name="tel" label="Телефон" />
                  <FormHelperText id="phone-helper-text">Введите номер обратной связи</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={() => {
                created();
              }}
            >
              Записаться
            </Button>
            <Button autoFocus color="secondary" onClick={onClose}>
              Отменить
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default memo(FormRecord);
