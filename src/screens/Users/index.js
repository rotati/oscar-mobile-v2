import React, { Component }                   from 'react'
import { connect }                            from 'react-redux'
import { styles }                             from './styles'
import { pushScreen }                         from '../../navigation/config'
import { fetchProvinces }                     from '../../redux/actions/provinces'
import { fetchDepartments }                   from '../../redux/actions/departments'
import { logoutUser }                         from '../../redux/actions/auth'
import { Navigation }                         from 'react-native-navigation'
import { find, capitalize }                   from 'lodash'
import DropdownAlert                          from 'react-native-dropdownalert'
import call                                   from 'react-native-phone-call'
import Button                                 from 'apsl-react-native-button'
import Field                                  from '../../components/Field'
import Card                                   from '../../components/Card'
import appIcon                                from '../../utils/Icon'
import i18n                                   from '../../i18n'
import {
  View,
  ScrollView,
  TouchableWithoutFeedback,
  Text
} from 'react-native'
class User extends Component {
  constructor(props) {
    super(props)
    this.props.fetchProvinces()
    this.props.fetchDepartments()
    Navigation.events().bindComponent(this)
  }

  alertMessage = () => {
    this.refs.dropdown.alertWithType('success', 'Success', 'User has been successfully updated.')
  }

  async navigationButtonPressed({ buttonId }) {
    if (buttonId === 'TRANSLATION') {
      pushScreen(this.props.componentId, {
        screen: 'oscar.language',
        title: i18n.t('language.languages')
      })
    } else if (buttonId === 'EDIT_USER') {
      const { departments, provinces, user } = this.props
      const icons = await appIcon()

      pushScreen(this.props.componentId, {
        screen: 'oscar.editUser',
        title: i18n.t('user.edit_title'),
        props: { departments, provinces, user, alertMessage: this.alertMessage },
        rightButtons: [
          {
            id: 'SAVE_USER',
            icon: icons.save,
            color: '#fff'
          }
        ]
      })
    }
  }

  render() {
    const { provinces, departments, user, loading } = this.props
    const { first_name, last_name, gender, job_title, department_id, mobile, email, date_of_birth, start_date, province_id } = user
    const department = find(departments, { id: department_id })
    const province = find(provinces, { id: province_id })
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Card title={i18n.t('user.about_user')}>
            <Field name={i18n.t('user.first_name')} value={first_name} />
            <Field name={i18n.t('user.last_name')} value={last_name} />
            <Field name={i18n.t('user.gender')} value={capitalize(gender)} />
            <Field name={i18n.t('user.job_title')} value={job_title} />
            <Field name={i18n.t('user.department')} value={department && department.name} />
            <Field name={i18n.t('user.mobile')}>
              {
                mobile && (
                  <TouchableWithoutFeedback onPress={() => call({ number: mobile, prompt: false }) }>
                    <Text style={{fontSize: 18, textDecorationLine: 'underline'}}>
                      {mobile}
                    </Text>
                  </TouchableWithoutFeedback>
                )
              }
            </Field>
            <Field name={i18n.t('user.email')} value={email} />
            <Field name={i18n.t('user.dob')} value={date_of_birth} />
            <Field name={i18n.t('user.start_date')} value={start_date} />
            <Field name={i18n.t('user.province')} value={province && province.name} />
          </Card>
        </ScrollView>
        <Button
          style={styles.logoutButton}
          textStyle={styles.buttonTitle}
          onPress={() => this.props.logoutUser()}
          isLoading={loading}
          isDisabled={loading}
        >
          {i18n.t('user.log_out')}
        </Button>
        <DropdownAlert ref="dropdown" updateStatusBar={false} useNativeDriver={true} />
      </View>
    )
  }
}

const mapState = state => ({
  user: state.auth.data,
  loading: state.auth.loading,
  departments: state.departments.data,
  provinces: state.provinces.data,
})

const mapDispatch = {
  fetchProvinces,
  fetchDepartments,
  logoutUser
}

export default connect(
  mapState,
  mapDispatch
)(User)
